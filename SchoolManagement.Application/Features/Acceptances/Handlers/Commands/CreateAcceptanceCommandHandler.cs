using AutoMapper;
using MediatR;
using SchoolManagement.Application.Contracts.Persistence;
using SchoolManagement.Application.DTOs.Acceptances.Validators;
using SchoolManagement.Application.Features.Acceptances.Requests.Commands;
using SchoolManagement.Application.Responses;
using SchoolManagement.Domain;

namespace SchoolManagement.Application.Features.Acceptances.Handlers.Commands
{
    public class CreateAcceptanceCommandHandler : IRequestHandler<CreateAcceptanceCommand, BaseCommandResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateAcceptanceCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BaseCommandResponse> Handle(CreateAcceptanceCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseCommandResponse();
            var validator = new CreateAcceptanceDtoValidator();
            var validationResult = await validator.ValidateAsync(request.AcceptanceDto);

            DateTime defaultDate = new DateTime(1970, 01, 01, 00, 00, 0);

            if (validationResult.IsValid == false)
            {
                response.Success = false;
                response.Message = "Creation Failed";
                response.Errors = validationResult.Errors.Select(q => q.ErrorMessage).ToList();
            }
            else
            {

                /////// File Upload //////////
                ///
                string uniqueFileName = null; 

                if (request.AcceptanceDto.Doc != null)
                {
                    var fileName = Path.GetFileName(request.AcceptanceDto.Doc.FileName);
                    uniqueFileName = Guid.NewGuid().ToString() + "_" + fileName;
                    var a = Directory.GetCurrentDirectory();
                    //var filePath = Path.Combine(_hostingEnv.WebRootPath, "Content\\images\\profile", uniqueFileName);
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\Content\\files\\acceptances", uniqueFileName);
                    using (var fileSteam = new FileStream(filePath, FileMode.Create))
                    {
                        await request.AcceptanceDto.Doc.CopyToAsync(fileSteam);
                    }
                }

                var acceptances = _mapper.Map<Acceptance>(request.AcceptanceDto);

                acceptances.AcceptanceDocument = request.AcceptanceDto.AcceptanceDocument ?? "files/acceptances/" + uniqueFileName;

                acceptances = await _unitOfWork.Repository<Acceptance>().Add(acceptances);
                acceptances.VerificationCompletStatus = 0;
                if (acceptances.SftDate.HasValue)
                    acceptances.SftDate = acceptances.SftDate.Value.AddDays(1.0);
                if (acceptances.WarrantyFrom.HasValue)
                    acceptances.WarrantyFrom = acceptances.WarrantyFrom.Value.AddDays(1.0);
                if (acceptances.WarrantyTo.HasValue)
                    acceptances.WarrantyTo = acceptances.WarrantyTo.Value.AddDays(1.0);
                if(request.AcceptanceDto.SftDate == defaultDate)
                {
                    acceptances.SftDate = null;
                }
                if(request.AcceptanceDto.WarrantyFrom == defaultDate)
                {
                    acceptances.WarrantyFrom = null;
                }
                if(request.AcceptanceDto.WarrantyTo == defaultDate)
                {
                    acceptances.WarrantyTo = null;
                }
                if(request.AcceptanceDto.DeliveryDate == defaultDate)
                {
                    acceptances.DeliveryDate = null;
                }
                await _unitOfWork.Save();

                var procurements = await _unitOfWork.Repository<Procurement>().Get((int)request.AcceptanceDto.ProcurementId);
                
              //procurements.ProcurementCompleteStatus = 1;

              var procSftQty = procurements.SftQty;
                var procQty = int.Parse(procurements.Qty);
                var sftQty = request.AcceptanceDto.SftQty;
                var remainProcQty = procSftQty + sftQty;
                procurements.SftQty = remainProcQty;
                if (remainProcQty < procQty)
                {
                    procurements.ProcurementCompleteStatus = 0;
                    
                }
                else
                {
                    procurements.ProcurementCompleteStatus = 1;
                }

                await _unitOfWork.Repository<Procurement>().Update(procurements);
                try
                {
                    await _unitOfWork.Save();
                }
                catch (Exception ex)
                {

                    Console.WriteLine(ex);
                }
                

                response.Success = true;
                response.Message = "Creation Successful";
                response.Id = acceptances.DemandId.Value;
            }

            return response;
        }
    }
}

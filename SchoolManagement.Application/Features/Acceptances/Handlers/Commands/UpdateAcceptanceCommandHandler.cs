using SchoolManagement.Domain;
using AutoMapper;
using MediatR;
using SchoolManagement.Application.Exceptions;
using SchoolManagement.Application.Contracts.Persistence;
using SchoolManagement.Application.DTOs.Acceptances.Validators;
using SchoolManagement.Application.Features.Acceptances.Requests.Commands;

namespace SchoolManagement.Application.Features.Acceptances.Handlers.Commands
{
    public class UpdateAcceptanceCommandHandler : IRequestHandler<UpdateAcceptanceCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateAcceptanceCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(UpdateAcceptanceCommand request, CancellationToken cancellationToken)
        {
            var validator = new UpdateAcceptanceDtoValidator(); 
            var validationResult = await validator.ValidateAsync(request.AcceptanceDto);

            DateTime defaultDate = new DateTime(1970, 01, 01, 00, 00, 0);

            if (validationResult.IsValid == false)
                throw new ValidationException(validationResult);

            var Acceptance = await _unitOfWork.Repository<Acceptance>().Get(request.AcceptanceDto.AcceptanceId);

            if (Acceptance is null)
                throw new NotFoundException(nameof(Acceptance), request.AcceptanceDto.AcceptanceId);

            //_mapper.Map(request.AcceptanceDto, Acceptance);

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

                // request.UpdateTraineeBIODataGeneralInfoDto.BnaPhotoUrl = "images/profile/" + uniqueFileName;
            }
          

            ////
            //  DateTime? d = request.TraineeBioDataGeneralInfoDto.DateOfBirth.ConvertToDateTime();




            _mapper.Map(request.AcceptanceDto, Acceptance);
            if (Acceptance.SftDate.HasValue)
                Acceptance.SftDate = Acceptance.SftDate.Value.AddDays(1.0);
            if (Acceptance.WarrantyFrom.HasValue)
                Acceptance.WarrantyFrom = Acceptance.WarrantyFrom.Value.AddDays(1.0);
            if (Acceptance.WarrantyTo.HasValue)
                Acceptance.WarrantyTo = Acceptance.WarrantyTo.Value.AddDays(1.0);
            if(request.AcceptanceDto.SftDate == defaultDate)
            {
                Acceptance.SftDate = null;
            }
            if(request.AcceptanceDto.WarrantyFrom == defaultDate)
            {
                Acceptance.WarrantyFrom = null;
            }
            if(request.AcceptanceDto.WarrantyTo == defaultDate)
            {
                Acceptance.WarrantyTo = null;
            }
            if(request.AcceptanceDto.DeliveryDate == defaultDate)
            {
                Acceptance.DeliveryDate = null;
            }

            //  request.TraineeBioDataGeneralInfoDto.BnaPhotoUrl = request.TraineeBioDataGeneralInfoDto.BnaPhotoUrl ?? TraineeBioDataGeneralInfos.BnaPhotoUrl;


            // TraineeBioDataGeneralInfos.BnaPhotoUrl = request.TraineeBioDataGeneralInfoDto.BnaPhotoUrl ?? "images/profile/" + uniqueFileName;
            Acceptance.AcceptanceDocument = request.AcceptanceDto.Doc != null ? "files/acceptances/" + uniqueFileName : Acceptance.AcceptanceDocument.Replace("https://localhost:44395/Content/", String.Empty);

            await _unitOfWork.Repository<Acceptance>().Update(Acceptance);

            
            await _unitOfWork.Save();

            return Unit.Value;
        }
    }
}

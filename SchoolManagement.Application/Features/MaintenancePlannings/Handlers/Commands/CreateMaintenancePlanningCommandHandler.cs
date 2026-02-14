using AutoMapper;
using MediatR;
using SchoolManagement.Application.Contracts.Persistence;
using SchoolManagement.Application.DTOs.MaintenancePlanning.Validators;
using SchoolManagement.Application.Features.MaintenancePlannings.Requests.Commands;
using SchoolManagement.Application.Responses;
using SchoolManagement.Domain;

namespace SchoolManagement.Application.Features.MaintenancePlannings.Handlers.Commands
{
    public class CreateMaintenancePlanningCommandHandler : IRequestHandler<CreateMaintenancePlanningCommand, BaseCommandResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateMaintenancePlanningCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BaseCommandResponse> Handle(CreateMaintenancePlanningCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseCommandResponse();
            var validator = new CreateMaintenancePlanningDtoValidator();
            var validationResult = await validator.ValidateAsync(request.MaintenancePlanningDto);

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

                string uniqueFileNameJobListDocument = null;


                if (request.MaintenancePlanningDto.JobList != null)
                {

                    var fileName = Path.GetFileName(request.MaintenancePlanningDto.JobList.FileName);
                    uniqueFileNameJobListDocument = Guid.NewGuid().ToString() + "_" + fileName;
                    var a = Directory.GetCurrentDirectory();
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\Content\\files\\maintenance-planning", uniqueFileNameJobListDocument);
                    using (var fileSteam = new FileStream(filePath, FileMode.Create))
                    {
                        await request.MaintenancePlanningDto.JobList.CopyToAsync(fileSteam);
                    }
                }

                
                var MaintenancePlanning = _mapper.Map<MaintenancePlanning>(request.MaintenancePlanningDto);
                MaintenancePlanning.JobListDocument = request.MaintenancePlanningDto.JobListDocument ?? "files/maintenance-planning/" + uniqueFileNameJobListDocument;
                //MaintenancePlanning.RequiredSpearsDoc = request.MaintenancePlanningDto.RequiredSpearsDoc ?? "files/maintenance-planning/" + uniqueFileNameRequiredSpearsDoc;
                //MaintenancePlanning.RequiredToolsDoc = request.MaintenancePlanningDto.RequiredToolsDoc ?? "files/maintenance-planning/" + uniqueFileNameRequiredToolsDoc;
                //MaintenancePlanning.RequiredConsumablesDoc = request.MaintenancePlanningDto.RequiredConsumablesDoc ?? "files/maintenance-planning/" + uniqueFileNameRequiredConsumablesDoc;
                MaintenancePlanning.VerificationCompletStatus = 0;
                MaintenancePlanning.CompletStatus = 0;
                MaintenancePlanning = await _unitOfWork.Repository<MaintenancePlanning>().Add(MaintenancePlanning);
                if (MaintenancePlanning.LastInspDate.HasValue)
                    MaintenancePlanning.LastInspDate = MaintenancePlanning.LastInspDate.Value.AddDays(1.0);
                if (MaintenancePlanning.NestInspDate.HasValue)
                    MaintenancePlanning.NestInspDate = MaintenancePlanning.NestInspDate.Value.AddDays(1.0);
                if(request.MaintenancePlanningDto.MaintenanceCategoryId == 2 || request.MaintenancePlanningDto.MaintenanceCategoryId == 36) {
                  if (request.MaintenancePlanningDto.NestInspDate == defaultDate)
                  {
                    MaintenancePlanning.NestInspDate = null;
                  }
                }else{
                  if (request.MaintenancePlanningDto.LastInspDate == defaultDate && request.MaintenancePlanningDto.NestInspDate == defaultDate)
                  {
                     MaintenancePlanning.LastInspDate = null;
                    MaintenancePlanning.NestInspDate = null;
                  }
                }
                

                await _unitOfWork.Save();
                

                response.Success = true;
                response.Message = "Creation Successful";
                response.Id = MaintenancePlanning.MaintenancePlanningId;
            }

            return response;
        }
    }
}

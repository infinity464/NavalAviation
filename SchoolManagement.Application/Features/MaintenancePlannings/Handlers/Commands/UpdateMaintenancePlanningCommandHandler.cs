using SchoolManagement.Domain;
using AutoMapper;
using MediatR;
using SchoolManagement.Application.DTOs.MaintenancePlanning.Validators;
using SchoolManagement.Application.Exceptions;
using SchoolManagement.Application.Features.MaintenancePlannings.Requests.Commands;
using SchoolManagement.Application.Contracts.Persistence;

namespace SchoolManagement.Application.Features.MaintenancePlannings.Handlers.Commands
{
    public class UpdateMaintenancePlanningCommandHandler : IRequestHandler<UpdateMaintenancePlanningCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateMaintenancePlanningCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(UpdateMaintenancePlanningCommand request, CancellationToken cancellationToken)
        {
            var validator = new UpdateMaintenancePlanningDtoValidator(); 
            var validationResult = await validator.ValidateAsync(request.UpdateMaintenancePlanningDto);
            DateTime defaultDate = new DateTime(1970, 01, 01, 00, 00, 0);

            if (validationResult.IsValid == false)
                throw new ValidationException(validationResult);

            var MaintenancePlanning = await _unitOfWork.Repository<MaintenancePlanning>().Get(request.UpdateMaintenancePlanningDto.MaintenancePlanningId);

            if (MaintenancePlanning is null)
                throw new NotFoundException(nameof(MaintenancePlanning), request.UpdateMaintenancePlanningDto.MaintenancePlanningId);

            /////// File Upload //////////
            //string uniqueFileName = null;
            ///
            string uniqueFileNameJobListDocument = null;
            string uniqueFileNameRequiredSpearsDoc = null;
            string uniqueFileNameRequiredToolsDoc = null;
            string uniqueFileNameRequiredConsumablesDoc = null;

            if (request.UpdateMaintenancePlanningDto.JobList != null)
            {

                var fileName = Path.GetFileName(request.UpdateMaintenancePlanningDto.JobList.FileName);
                uniqueFileNameJobListDocument = Guid.NewGuid().ToString() + "_" + fileName;
                var a = Directory.GetCurrentDirectory();
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\Content\\files\\maintenance-planning", uniqueFileNameJobListDocument);

                using (var fileSteam = new FileStream(filePath, FileMode.Create))
                {
                    await request.UpdateMaintenancePlanningDto.JobList.CopyToAsync(fileSteam);
                }
            }
            



            _mapper.Map(request.UpdateMaintenancePlanningDto, MaintenancePlanning);
            if (MaintenancePlanning.LastInspDate.HasValue)
                MaintenancePlanning.LastInspDate = MaintenancePlanning.LastInspDate.Value.AddDays(1.0);
            //MaintenancePlanning.NestInspDate = MaintenancePlanning.NestInspDate.Value.AddDays(1.0);
            if (request.UpdateMaintenancePlanningDto.NestInspDate == defaultDate)
            {
               MaintenancePlanning.NestInspDate = null;
            }
            MaintenancePlanning.JobListDocument = request.UpdateMaintenancePlanningDto.JobList != null ? "files/maintenance-planning/" + uniqueFileNameJobListDocument : MaintenancePlanning.JobListDocument.Replace("https://localhost:44395/Content/", String.Empty);
            
            
            //MaintenancePlanning.RequiredSpearsDoc = request.UpdateMaintenancePlanningDto.SpearsDoc != null ? "files/maintenance-planning/" + uniqueFileNameRequiredSpearsDoc : MaintenancePlanning.RequiredSpearsDoc.Replace("https://localhost:44395/Content/", String.Empty);
            //MaintenancePlanning.RequiredToolsDoc = request.UpdateMaintenancePlanningDto.ToolsDoc != null ? "files/maintenance-planning/" + uniqueFileNameRequiredToolsDoc : MaintenancePlanning.RequiredToolsDoc.Replace("https://localhost:44395/Content/", String.Empty);
            //MaintenancePlanning.RequiredConsumablesDoc = request.UpdateMaintenancePlanningDto.ConsumableDoc != null ? "files/maintenance-planning/" + uniqueFileNameRequiredConsumablesDoc : MaintenancePlanning.RequiredConsumablesDoc.Replace("https://localhost:44395/Content/", String.Empty);

            await _unitOfWork.Repository<MaintenancePlanning>().Update(MaintenancePlanning);
            await _unitOfWork.Save();

            return Unit.Value;
        }
    }
}

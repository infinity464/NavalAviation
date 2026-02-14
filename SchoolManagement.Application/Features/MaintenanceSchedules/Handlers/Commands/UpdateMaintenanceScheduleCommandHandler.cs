using SchoolManagement.Domain;
using AutoMapper;
using MediatR;
using SchoolManagement.Application.DTOs.MaintenanceSchedule.Validators;
using SchoolManagement.Application.Exceptions;
using SchoolManagement.Application.Features.MaintenanceSchedules.Requests.Commands;
using SchoolManagement.Application.Contracts.Persistence;

namespace SchoolManagement.Application.Features.MaintenanceSchedules.Handlers.Commands
{
    public class UpdateMaintenanceScheduleCommandHandler : IRequestHandler<UpdateMaintenanceScheduleCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateMaintenanceScheduleCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(UpdateMaintenanceScheduleCommand request, CancellationToken cancellationToken)
        {
            var validator = new UpdateMaintenanceScheduleDtoValidator();
            var validationResult = await validator.ValidateAsync(request.UpdateMaintenanceScheduleDto);

            if (validationResult.IsValid == false)
                throw new ValidationException(validationResult);

            var MaintenanceSchedule = await _unitOfWork.Repository<MaintenanceSchedule>().Get(request.UpdateMaintenanceScheduleDto.MaintenanceScheduleId);

            if (MaintenanceSchedule is null)
                throw new NotFoundException(nameof(MaintenanceSchedule), request.UpdateMaintenanceScheduleDto.MaintenanceScheduleId);
            
            /////// File Upload //////////
            
            string uniqueFileName = null;
            
            if (request.UpdateMaintenanceScheduleDto.Doc != null)
            {

                var fileName = Path.GetFileName(request.UpdateMaintenanceScheduleDto.Doc.FileName);
                uniqueFileName = Guid.NewGuid().ToString() + "_" + fileName;
                var a = Directory.GetCurrentDirectory();
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\Content\\files\\maintenance-schedules", uniqueFileName);
                using (var fileSteam = new FileStream(filePath, FileMode.Create))
                {
                    await request.UpdateMaintenanceScheduleDto.Doc.CopyToAsync(fileSteam);
                }


            }
            _mapper.Map(request.UpdateMaintenanceScheduleDto, MaintenanceSchedule);
            if (MaintenanceSchedule.StartInspDate.HasValue)
                MaintenanceSchedule.StartInspDate = MaintenanceSchedule.StartInspDate.Value.AddDays(1.0);

            MaintenanceSchedule.MaintenanceDocument = request.UpdateMaintenanceScheduleDto.Doc != null ? "files/maintenance-schedules/" + uniqueFileName : MaintenanceSchedule.MaintenanceDocument.Replace("https://localhost:44395/Content/", String.Empty);
            await _unitOfWork.Repository<MaintenanceSchedule>().Update(MaintenanceSchedule);
            await _unitOfWork.Save();

            return Unit.Value;
        }
    }
}

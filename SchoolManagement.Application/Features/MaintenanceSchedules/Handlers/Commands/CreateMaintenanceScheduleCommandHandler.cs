using AutoMapper;
using MediatR;
using SchoolManagement.Application.Contracts.Persistence;
using SchoolManagement.Application.DTOs.MaintenanceSchedule.Validators;
using SchoolManagement.Application.Features.MaintenanceSchedules.Requests.Commands;
using SchoolManagement.Application.Responses;
using SchoolManagement.Domain;

namespace SchoolManagement.Application.Features.MaintenanceSchedules.Handlers.Commands
{
    public class CreateMaintenanceScheduleCommandHandler : IRequestHandler<CreateMaintenanceScheduleCommand, BaseCommandResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateMaintenanceScheduleCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BaseCommandResponse> Handle(CreateMaintenanceScheduleCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseCommandResponse();
            var validator = new CreateMaintenanceScheduleDtoValidator();
            var validationResult = await validator.ValidateAsync(request.MaintenanceScheduleDto);

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

                if (request.MaintenanceScheduleDto.Doc != null)
                {

                    var fileName = Path.GetFileName(request.MaintenanceScheduleDto.Doc.FileName);
                    uniqueFileName = Guid.NewGuid().ToString() + "_" + fileName;
                    var a = Directory.GetCurrentDirectory();
                    //var filePath = Path.Combine(_hostingEnv.WebRootPath, "Content\\images\\profile", uniqueFileName);
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\Content\\files\\maintenance-schedules", uniqueFileName);
                    using (var fileSteam = new FileStream(filePath, FileMode.Create))
                    {
                        await request.MaintenanceScheduleDto.Doc.CopyToAsync(fileSteam);
                    }


                }

                var MaintenanceSchedules = _mapper.Map<MaintenanceSchedule>(request.MaintenanceScheduleDto);
                MaintenanceSchedules.MaintenanceDocument = request.MaintenanceScheduleDto.MaintenanceDocument ?? "files/maintenance-schedules/" + uniqueFileName;
                MaintenanceSchedules.VerificationCompletStatus = 0;
                MaintenanceSchedules = await _unitOfWork.Repository<MaintenanceSchedule>().Add(MaintenanceSchedules);
                if (MaintenanceSchedules.StartInspDate.HasValue)
                    MaintenanceSchedules.StartInspDate = MaintenanceSchedules.StartInspDate.Value.AddDays(1.0);
                if (MaintenanceSchedules.EndInspDate.HasValue)
                    MaintenanceSchedules.EndInspDate = MaintenanceSchedules.EndInspDate.Value.AddDays(1.0);

                await _unitOfWork.Save();

                response.Success = true;
                response.Message = "Creation Successful";
                response.Id = MaintenanceSchedules.MaintenanceScheduleId;
            }

            return response;
        }
    }
}

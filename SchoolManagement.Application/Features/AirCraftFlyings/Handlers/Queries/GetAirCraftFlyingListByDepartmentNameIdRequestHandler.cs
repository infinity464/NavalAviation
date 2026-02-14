using AutoMapper;
using MediatR;
using SchoolManagement.Application.Contracts.Persistence;
using SchoolManagement.Domain;
using SchoolManagement.Application.DTOs.AirCraftFlying;
using SchoolManagement.Application.Features.AirCraftFlyings.Requests.Queries;
using System.Globalization;

namespace SchoolManagement.Application.Features.AirCraftFlyings.Handlers.Queries
{
    public class GetAirCraftFlyingListByDepartmentNameIdRequestHandler : IRequestHandler<GetAirCraftFlyingListByDepartmentNameIdRequest, List<AirCraftFlyingDto>>
    {
        private readonly ISchoolManagementRepository<AirCraftFlying> _AirCraftFlyingRepository;

        private readonly IMapper _mapper;
        public GetAirCraftFlyingListByDepartmentNameIdRequestHandler(ISchoolManagementRepository<AirCraftFlying> AirCraftFlyingRepository, IMapper mapper)
        {
            _AirCraftFlyingRepository = AirCraftFlyingRepository;
            _mapper = mapper;
        }

        public async Task<List<AirCraftFlyingDto>> Handle(GetAirCraftFlyingListByDepartmentNameIdRequest request, CancellationToken cancellationToken)
        {

      try
      {
        IQueryable<AirCraftFlying> AirCraftFlyings = _AirCraftFlyingRepository.FilterWithInclude(x => x.AirCraftNameId == request.AirCraftNameId && x.DepartmentNameId == request.DepartmentNameId, "DepartmentName", "AirCraftName");
        var totalCount = AirCraftFlyings.Count();
        AirCraftFlyings = AirCraftFlyings.OrderByDescending(x => x.Date);
        var AirCraftFlyingDtos = _mapper.Map<List<AirCraftFlyingDto>>(AirCraftFlyings);

        //AIrcraft in flight Code
        var aircraftFlyingDto = new List<AirCraftFlyingDto>();
        var aircraftFlyingDtoReturn = new List<AirCraftFlyingDto>();

        foreach (var item in AirCraftFlyingDtos)
        {
          // Startup Time Conversion - skip calculations when StartUp or Endurance is null/empty
          string input = item.StartUp;
          if (!string.IsNullOrEmpty(input) && !string.IsNullOrEmpty(item.Endurance))
          {
            if (DateTime.TryParseExact(input, "H:m", null, DateTimeStyles.None, out var timeFromInput))
            {
              string timeIn12HourFormatForDisplay = timeFromInput.ToString("hh:mm tt", CultureInfo.InvariantCulture);

              // Time Calculation - use TryParse to avoid exception on invalid format
              if (TimeSpan.TryParse(DateTime.Now.ToString("HH:mm"), out var currentTime) &&
                  TimeSpan.TryParse(item.StartUp, out var startup) &&
                  TimeSpan.TryParse(item.Endurance, out var endTime))
              {
                // Running Hour and Rest Hour Calculation
                var runningTime = currentTime - startup;
                var restTime = endTime - currentTime;
                item.RunningHour = runningTime;
                item.RestHour = restTime;

                // Running hour and rest hour percentage
                var duration = endTime - startup;
                if (duration.TotalMinutes > 0)
                {
                  var runningPercentage = (runningTime.TotalMinutes * 100) / duration.TotalMinutes;
                  var restPercentage = 100 - runningPercentage;
                  item.RunningPercentage = Math.Round(runningPercentage, 0);
                  item.RestPercentage = Math.Round(restPercentage, 0);
                }

                item.StartUp = timeIn12HourFormatForDisplay;
              }
            }
          }
          aircraftFlyingDto.Add(item);
        }
        return aircraftFlyingDto;

      }catch(Exception ex)
      {
        return null;
      }


    }

    }
}

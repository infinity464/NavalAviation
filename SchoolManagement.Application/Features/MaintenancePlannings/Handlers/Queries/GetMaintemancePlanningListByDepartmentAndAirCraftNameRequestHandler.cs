using AutoMapper;
using MediatR;
using SchoolManagement.Application.Contracts.Persistence;
using SchoolManagement.Domain;
using SchoolManagement.Application.DTOs.MaintenancePlanning;
using SchoolManagement.Application.Features.MaintenancePlannings.Requests.Queries;

namespace SchoolManagement.Application.Features.MaintenancePlannings.Handlers.Queries
{
    public class GetMaintemancePlanningListByDepartmentAndAirCraftNameRequestHandler : IRequestHandler<GetMaintemancePlanningListByDepartmentAndAirCraftNameRequest, List<MaintenancePlanningDto>>
    {
        private readonly ISchoolManagementRepository<MaintenancePlanning> _MaintenancePlanningRepository;

        private readonly IMapper _mapper;
        public GetMaintemancePlanningListByDepartmentAndAirCraftNameRequestHandler(ISchoolManagementRepository<MaintenancePlanning> MaintenancePlanningRepository, IMapper mapper)
        {
            _MaintenancePlanningRepository = MaintenancePlanningRepository;
            _mapper = mapper;
        }

        public async Task<List<MaintenancePlanningDto>> Handle(GetMaintemancePlanningListByDepartmentAndAirCraftNameRequest request, CancellationToken cancellationToken)
        {

      try
      {
        IQueryable<MaintenancePlanning> MaintenancePlannings = _MaintenancePlanningRepository.FilterWithInclude(x => x.AirCraftNameId == request.AirCraftNameId && x.DepartmentNameId == request.DepartmentNameId && x.CompletStatus != 1, "DepartmentName", "AirCraftName", "MaintenanceType", "MaintenanceCategory", "MaintenanceSubCategory", "MaintenancePlanningStatus").OrderBy(x => x.MaintenanceSubCategoryId ?? 0);

        var MaintenancePlanningDtos = _mapper.Map<List<MaintenancePlanningDto>>(MaintenancePlannings);

        return MaintenancePlanningDtos;
      }catch (Exception ex)
      {
        return null;
      }
          
        }

    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Services.Contract;

namespace Api.Controllers
{
    [Route("api/geospatial")]
    [ApiController]
    public class GeospatialController : ControllerBase
    {
        private readonly IGeospatialService _geospatialService;
        private readonly IMapper _mapper;

        public GeospatialController(IGeospatialService geoDataService, IMapper mapper)
        {
            _geospatialService = geoDataService;
            _mapper = mapper;
        }

        [Route("areas")]
        public async Task<List<ApiDto.Area>> GetAreas()
        {
            var result = await _geospatialService.GetAreasAsync();
            return _mapper.Map<List<ApiDto.Area>>(result);
        }
    }
}
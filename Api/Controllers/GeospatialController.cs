using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using DomainModels.Geospatial;
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

        [HttpPost]
        [Route("savelayer")]
        public async Task<ApiDto.GeoFeatureLayer> SaveGeoLayer(ApiDto.GeoFeatureLayer layer)
        {
            var geoLayerDto = _mapper.Map<GeoSpatialLayer>(layer);
           var result = await _geospatialService.SaveGeoLayerAsync(geoLayerDto);
            return _mapper.Map<ApiDto.GeoFeatureLayer>(result);
        }

        [HttpGet]
        [Route("myareas")]
        public async Task<List<ApiDto.GeoFeatureLayer>> GetMyAreas()
        {
            var result = await _geospatialService.GetMyAreasAsync();
            return _mapper.Map<List<ApiDto.GeoFeatureLayer>>(result);
        }
    }
}
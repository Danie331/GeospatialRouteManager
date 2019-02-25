using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using DomainModels.Geospatial;
using Microsoft.AspNetCore.Mvc;
using Services.Contract;

// TODO:
// 1. Add logging
// 2. Add security
// 3. Add bundling + minification
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

        [HttpPost]
        [Route("findlocation")]
        public async Task<ApiDto.GeoLocation> GetLocation(ApiDto.GeoLocation location)
        {
            var locationDto = _mapper.Map<GeoLocation>(location);
            var result = await _geospatialService.GetLocationAsync(locationDto);
            return _mapper.Map<ApiDto.GeoLocation>(result);
        }
    }
}
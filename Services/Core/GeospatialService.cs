
using DomainModels.Geospatial;
using Repository.Contract;
using Services.Contract;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Core
{
    public class GeospatialService : IGeospatialService
    {
        private readonly IGeospatialRepository _geospatialRepository;

        public GeospatialService(IGeospatialRepository geospatialRepository)
        {
            _geospatialRepository = geospatialRepository;
        }

        public async Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer)
        {
            return await _geospatialRepository.SaveGeoLayerAsync(layer);
        }

        public async Task<List<GeoSpatialLayer>> GetMyAreasAsync()
        {
            var areas = await _geospatialRepository.GetMyAreasAsync();
            return areas;
        }
    }
}

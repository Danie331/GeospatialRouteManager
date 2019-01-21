
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

        public async Task<List<Area>> GetAreasAsync()
        {
            var areas = await _geospatialRepository.GetAreasAsync();
            return areas;
        }
    }
}

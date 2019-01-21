
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using DataRepository.Contract;
using DomainModels.Geospatial;
using System.Linq;

namespace DataRepository.Core
{
    public class GeospatialRepository : IGeospatialRepository
    {
        private readonly IGeospatialContext _geospatialContext;
        private readonly IMapper _mapper;

        public GeospatialRepository(IGeospatialContext geospatialContext, IMapper mapper)
        {
            _geospatialContext = geospatialContext;
            _mapper = mapper;
        }
        
        public async Task<List<Area>> GetAreasAsync()
        {
            var spatialAreas = _geospatialContext.SpatialArea.Select(a => a).ToList();
            var areas = _mapper.Map<List<Area>>(spatialAreas);

            return await Task.FromResult(areas);
        }
    }
}
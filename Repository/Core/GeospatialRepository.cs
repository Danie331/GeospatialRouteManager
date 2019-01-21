
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Repository.Contract;
using DomainModels.Geospatial;
using Microsoft.EntityFrameworkCore;
using Repository.DataContext;

namespace Repository.Core
{
    public class GeospatialRepository : IGeospatialRepository
    {
        private readonly GeospatialContext _geospatialContext;
        private readonly IMapper _mapper;

        public GeospatialRepository(GeospatialContext geospatialContext, IMapper mapper)
        {
            _geospatialContext = geospatialContext;
            _mapper = mapper;
        }
        
        public async Task<List<Area>> GetAreasAsync()
        {
            var spatialAreas = await _geospatialContext.SpatialArea.ToListAsync();
            var areas = _mapper.Map<List<Area>>(spatialAreas);

            return areas;
        }
    }
}
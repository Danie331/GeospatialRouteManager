
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Repository.Contract;
using DomainModels.Geospatial;
using Microsoft.EntityFrameworkCore;
using Repository.DataContext;
using NetTopologySuite.IO;

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

        public async Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer)
        {
            var dataDto = _mapper.Map<DataModels.SpatialArea>(layer);
            if (dataDto.Id > 0)
            {
                var targetLayer = await _geospatialContext.SpatialArea.FirstOrDefaultAsync(sa => sa.Id == dataDto.Id);
                if (targetLayer != null)
                {
                    targetLayer.AreaName = dataDto.AreaName;
                    targetLayer.GeoLayer = dataDto.GeoLayer;
                }
            }
            else
            {
                await _geospatialContext.SpatialArea.AddAsync(dataDto);
            }

            await _geospatialContext.SaveChangesAsync();
            return _mapper.Map<GeoSpatialLayer>(dataDto);
        }

        public async Task<List<GeoSpatialLayer>> GetMyAreasAsync()
        {
            var spatialAreas = await _geospatialContext.SpatialArea.ToListAsync();
            var areas = _mapper.Map<List<GeoSpatialLayer>>(spatialAreas);

            return areas;
        }
    }
}
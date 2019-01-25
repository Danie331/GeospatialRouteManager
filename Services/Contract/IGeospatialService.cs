using DomainModels.Geospatial;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Contract
{
    public interface IGeospatialService
    {
        Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer);
        Task<List<GeoSpatialLayer>> GetMyAreasAsync();
    }
}

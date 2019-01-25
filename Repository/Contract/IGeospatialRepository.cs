
using DomainModels.Geospatial;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Contract
{
    public interface IGeospatialRepository
    {
        Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer);
        Task<List<GeoSpatialLayer>> GetMyAreasAsync();
    }
}

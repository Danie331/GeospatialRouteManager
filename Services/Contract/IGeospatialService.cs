using DomainModels.Geospatial;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Contract
{
    public interface IGeospatialService
    {
        Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer);
        Task<List<GeoSpatialLayer>> GetMyAreasAsync();
        Task<List<GeoSpatialLayer>> GetAllAreasAsync();
        Task<GeoLocation> GetLocationAsync(GeoLocation location);
        Task<List<SearchSuburb>> GetMatchingSuburbsAsync(string searchText);
        Task<List<SearchAddress>> GetMatchingAddressesAsync(string searchText, int suburbId);
        Task<List<SearchAddress>> GetMatchingSectionalTitlesAsync(string searchText, int suburbId);
        Task<GeoLocation> GetWhat3WordsAsync(GeoLocation locationDto);
        Task DeleteGeoLayerAsync(GeoSpatialLayer layer);
    }
}

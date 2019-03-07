
using DomainModels.Geospatial;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Contract
{
    public interface IGeospatialRepository
    {
        Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer);
        Task<List<GeoSpatialLayer>> GetMyAreasAsync();
        Task<List<SearchSuburb>> FindSuburbsSimilarToAsync(string searchText);
        Task<List<SearchAddress>> FindAddressesWithStreetNumberAsync(string searchText, int suburbId);
        Task<List<SearchAddress>> FindAddressesContainingStringAsync(string searchText, int suburbId);
        Task<List<SearchAddress>> FindAddressesStartingWithStringAsync(string searchText, int suburbId);
        Task<List<SearchAddress>> FindSectionalTitlesContainingStringAsync(string searchText, int suburbId);
        Task<GeoLocation> FindAddressByIdAsync(int locationId);
    }
}

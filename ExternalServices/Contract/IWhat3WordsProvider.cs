
using DomainModels.Geospatial;
using System.Threading.Tasks;

namespace ExternalServices.Contract
{
    public interface IWhat3WordsProvider
    {
        Task<string> ReverseGeocode(double lat, double lng);
        Task<GeoLocation> ForwardGeocode(string words);
    }
}

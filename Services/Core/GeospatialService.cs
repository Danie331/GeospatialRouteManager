
using DomainModels.Geospatial;
using Repository.Contract;
using Services.Contract;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using ExternalServices.Contract;
using System;

namespace Services.Core
{
    public class GeospatialService : IGeospatialService
    {
        private readonly IWhat3WordsProvider _what3WordsProvider; 
        private readonly IGeospatialRepository _geospatialRepository;

        public GeospatialService(
            IWhat3WordsProvider what3WordsProvider,
            IGeospatialRepository geospatialRepository)
        {
            _what3WordsProvider = what3WordsProvider;
            _geospatialRepository = geospatialRepository;
        }

        public async Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer)
        {
            return await _geospatialRepository.SaveGeoLayerAsync(layer);
        }

        public async Task<List<GeoSpatialLayer>> GetMyAreasAsync()
        {
            var areas = await _geospatialRepository.GetMyAreasAsync();
            return areas.OrderBy(a => a.LayerName).ToList();
        }

        public async Task<GeoLocation> GetLocationAsync(GeoLocation location)
        {
            if (location.LocationId > 0)
            {
                location = await _geospatialRepository.FindAddressByIdAsync(location.LocationId);
                if (string.IsNullOrEmpty(location.What3Words))
                {
                    location.What3Words = await _what3WordsProvider.ReverseGeocode(location.Lat, location.Lng);
                    // TODO: save to db - not here but from save btn.
                }
            }
            else
            {
                try
                {
                    if (!string.IsNullOrEmpty(location.What3Words))
                    {
                        // first search db for w3w, else ...
                        location = await _what3WordsProvider.ForwardGeocode(location.What3Words);
                    }
                    else
                    {
                        location.What3Words = await _what3WordsProvider.ReverseGeocode(location.Lat, location.Lng);
                    }
                }
                catch (Exception ex)
                {
                    // Log.
                }
            }
            return location;
        }

        public async Task<List<SearchSuburb>> GetMatchingSuburbsAsync(string searchText)
        {
            return await _geospatialRepository.FindSuburbsSimilarToAsync(searchText);
        }

        public async Task<List<SearchAddress>> GetMatchingAddressesAsync(string searchText, int suburbId)
        {
            var firstWord = searchText.IndexOf(" ") > -1 ? searchText.Substring(0, searchText.IndexOf(" ")) : searchText;
            var hasStreetNumber = firstWord.Any(char.IsDigit);

            if (hasStreetNumber)
            {
                // Search by street number
                return await _geospatialRepository.FindAddressesWithStreetNumberAsync(searchText, suburbId);
            }

            if (searchText.Length >= 4)
            {
                // "Contains" search
                return await _geospatialRepository.FindAddressesContainingStringAsync(searchText, suburbId);
            }

            // All other cases search from start of address
            return await _geospatialRepository.FindAddressesStartingWithStringAsync(searchText, suburbId);
        }

        public async Task<List<SearchAddress>> GetMatchingSectionalTitlesAsync(string searchText, int suburbId)
        {
            return await _geospatialRepository.FindSectionalTitlesContainingStringAsync(searchText, suburbId);
        }
    }
}

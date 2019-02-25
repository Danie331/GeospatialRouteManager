
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
            // go to db first
            try
            {
                if (!string.IsNullOrEmpty(location.What3Words))
                {
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

            return location;
        }
    }
}

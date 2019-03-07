
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

        public async Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer)
        {
            var dataDto = _mapper.Map<DataModels.SpatialArea>(layer);
            if (dataDto.Id > 0)
            {
                var targetLayer = await _geospatialContext.SpatialArea.FirstOrDefaultAsync(sa => sa.Id == dataDto.Id);
                if (targetLayer != null)
                {
                    targetLayer.AreaName = dataDto.AreaName;
                    targetLayer.Level = dataDto.Level;
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

        public async Task<List<SearchSuburb>> FindSuburbsSimilarToAsync(string searchText)
        {
            return await Task.FromResult(new List<SearchSuburb>
            {
                 new SearchSuburb { SuburbId = 1, FormattedName = "Claremont Upper, Southern Suburbs, Cape Town" },
                 new SearchSuburb { SuburbId = 2, FormattedName = "Claremont Mid, Southern Suburbs, Cape Town" },
                 new SearchSuburb { SuburbId = 3, FormattedName = "Claremont, Randberg, Gauteng Province" }
            });
        }

        public async Task<List<SearchAddress>> FindAddressesWithStreetNumberAsync(string searchText, int suburbId)
        {
            return await Task.FromResult(new List<SearchAddress>
            {
                new SearchAddress { AddressLocationId = 1, FormattedAddress ="123 Stringer Street, Claremont, Cape Town" },
                new SearchAddress { AddressLocationId = 2, FormattedAddress ="1a Beta road, Somerset west, Cape Town" },
                new SearchAddress { AddressLocationId = 3, FormattedAddress ="1b Beta Road, Somerset west, Cape Town" },
            });
        }

        public async Task<List<SearchAddress>> FindAddressesContainingStringAsync(string searchText, int suburbId)
        {
            return await Task.FromResult(new List<SearchAddress>
            {
                new SearchAddress { AddressLocationId = 1, FormattedAddress ="123 Stringer Street, Claremont, Cape Town" },
                new SearchAddress { AddressLocationId = 2, FormattedAddress ="1a Beta road, Somerset west, Cape Town" },
                new SearchAddress { AddressLocationId = 3, FormattedAddress ="1b Beta Road, Somerset west, Cape Town" },
            });
        }

        public async Task<List<SearchAddress>> FindAddressesStartingWithStringAsync(string searchText, int suburbId)
        {
            return await Task.FromResult(new List<SearchAddress>
            {
                new SearchAddress { AddressLocationId = 1, FormattedAddress ="123 Stringer Street, Claremont, Cape Town" },
                new SearchAddress { AddressLocationId = 2, FormattedAddress ="1a Beta road, Somerset west, Cape Town" },
                new SearchAddress { AddressLocationId = 3, FormattedAddress ="1b Beta Road, Somerset west, Cape Town" },
            });
        }

        public async Task<List<SearchAddress>> FindSectionalTitlesContainingStringAsync(string searchText, int suburbId)
        {
            return await Task.FromResult(new List<SearchAddress>
            {
                new SearchAddress { AddressLocationId = 1, FormattedAddress = "Dolphin Inn Guest House"},
                new SearchAddress { AddressLocationId = 2, FormattedAddress = "SS Mountain view"  }
            });
        }

        public async Task<GeoLocation> FindAddressByIdAsync(int locationId)
        {
            return new GeoLocation { LocationId = locationId, FormattedAddress = "123 Test street", Lat = -33.930889, Lng = 18.452491 };
        }
    }
}
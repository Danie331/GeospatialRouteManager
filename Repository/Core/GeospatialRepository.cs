
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Repository.Contract;
using DomainModels.Geospatial;
using Microsoft.EntityFrameworkCore;
using Repository.DataContext;
using System.Linq;

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
            var spatialAreas = await _geospatialContext.SpatialArea.Where(s => !s.Deleted).ToListAsync();
            var areas = _mapper.Map<List<GeoSpatialLayer>>(spatialAreas);

            return areas;
        }

        public async Task DeleteGeoLayerAsync(int id)
        {
            var targetLayer = await _geospatialContext.SpatialArea.FirstAsync(d => d.Id == id);
            targetLayer.Deleted = true;
            await _geospatialContext.SaveChangesAsync();
        }

        public async Task<List<SearchSuburb>> FindSuburbsSimilarToAsync(string searchText)
        {
            var targetRecords = await _geospatialContext.Suburb.Where(s => s.LongName.ToLower().Contains(searchText.ToLower())).ToListAsync();
            var matchingSuburbs = _mapper.Map<List<SearchSuburb>>(targetRecords);

            return matchingSuburbs;
        }

        public async Task<List<SearchAddress>> FindAddressesWithStreetNumberAsync(string searchText, int suburbId)
        {
            var targetRecords = await _geospatialContext.Address.Where(s => s.SuburbId == suburbId && 
                                                                    s.FullAddress.StartsWith(searchText))
                                                                    .GroupBy(g => g.FullAddress)
                                                                    .Select(g => g.First())
                                                                    .ToListAsync();
            var matchingAddresses = _mapper.Map<List<SearchAddress>>(targetRecords);

            return matchingAddresses;
        }

        public async Task<List<SearchAddress>> FindAddressesContainingStringAsync(string searchText, int suburbId)
        {
            var targetRecords = await _geospatialContext.Address.Where(s => s.SuburbId == suburbId &&
                                                                s.FullAddress.ToLower().Contains(searchText.ToLower()))
                                                                .GroupBy(g => g.FullAddress)
                                                                .Select(g => g.First())
                                                                .ToListAsync();
            var matchingAddresses = _mapper.Map<List<SearchAddress>>(targetRecords);

            return matchingAddresses;
        }

        public async Task<List<SearchAddress>> FindAddressesStartingWithStringAsync(string searchText, int suburbId)
        {
            var targetRecords = await _geospatialContext.Address.Where(s => s.SuburbId == suburbId && 
                                                                    s.FullAddress.ToLower().StartsWith(searchText.ToLower()))
                                                                    .GroupBy(g => g.FullAddress)
                                                                    .Select(g => g.First())
                                                                    .ToListAsync();
            var matchingAddresses = _mapper.Map<List<SearchAddress>>(targetRecords);

            return matchingAddresses;
        }

        public async Task<List<SearchAddress>> FindSectionalTitlesContainingStringAsync(string searchText, int suburbId)
        {
            var targetRecords = await _geospatialContext.Address.Where(s => s.SuburbId == suburbId &&
                                                                   s.SsName != null &&
                                                                   s.SsName.ToLower().Contains(searchText.ToLower()))
                                                                   .GroupBy(g => g.FullAddress)
                                                                   .Select(g => g.First())
                                                                  .ToListAsync();
            var matchingAddresses = _mapper.Map<List<SearchAddress>>(targetRecords);

            return matchingAddresses;
        }

        public async Task<GeoLocation> FindAddressByIdAsync(int locationId)
        {
            var targetRecord = await _geospatialContext.Address.FirstAsync(s => s.AddressId == locationId);
            var addressLocation = _mapper.Map<GeoLocation>(targetRecord);
            return addressLocation;
        }
    }
}
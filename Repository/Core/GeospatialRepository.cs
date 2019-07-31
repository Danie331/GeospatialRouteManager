
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Repository.Contract;
using DomainModels.Geospatial;
using Microsoft.EntityFrameworkCore;
using Repository.DataContext;
using System.Linq;
using Repository.DataModels;

namespace Repository.Core
{
    public class GeospatialRepository : IGeospatialRepository
    {
        private readonly IUserRepository _userRepository;
        private readonly GeospatialContext _geospatialContext;
        private readonly IMapper _mapper;

        public GeospatialRepository(IUserRepository userRepository,
            GeospatialContext geospatialContext,
            IMapper mapper)
        {
            _userRepository = userRepository;
            _geospatialContext = geospatialContext;
            _mapper = mapper;
        }

        public async Task<GeoSpatialLayer> SaveGeoLayerAsync(GeoSpatialLayer layer)
        {
            var dataDto = _mapper.Map<DataModels.SpatialArea>(layer);
            if (dataDto.Id > 0)
            {
                var targetLayer = await _geospatialContext.SpatialArea
                                                          .Include(s => s.MetaInfo)
                                                          .Include(s => s.MetaInfo).ThenInclude(s => s.PublicTag)
                                                          .Include(s => s.MetaInfo).ThenInclude(s => s.UserTag)
                                                          .Where(sa => sa.Id == dataDto.Id)
                                                          .FirstOrDefaultAsync();
                if (targetLayer != null)
                {
                    targetLayer.AreaName = dataDto.AreaName;
                    targetLayer.GeoPolygon = dataDto.GeoPolygon;

                    targetLayer.MetaInfo.PublicTag.TagName = dataDto.MetaInfo.PublicTag.TagName;
                    targetLayer.MetaInfo.PublicTag.TagValue = dataDto.MetaInfo.PublicTag.TagValue;
                    if (dataDto.MetaInfo.UserTag != null)
                    {
                        if (targetLayer.MetaInfo.UserTag == null)
                        {
                            targetLayer.MetaInfo.UserTag = new UserTag { TagName = dataDto.MetaInfo.UserTag.TagName, TagValue = dataDto.MetaInfo.UserTag.TagValue, UserId = _userRepository.GetCurrentUserId() };
                        }
                        else
                        {
                            targetLayer.MetaInfo.UserTag.TagName = dataDto.MetaInfo.UserTag.TagName;
                            targetLayer.MetaInfo.UserTag.TagValue = dataDto.MetaInfo.UserTag.TagValue;
                            targetLayer.MetaInfo.UserTag.UserId = _userRepository.GetCurrentUserId();
                        }
                    }
                }
            }
            else
            {
                var metaInfo = new DataModels.LayerMetaInfo
                {
                    PublicTag = new PublicTag { TagName = dataDto.MetaInfo.PublicTag.TagName, TagValue = dataDto.MetaInfo.PublicTag.TagValue },
                };
                if (dataDto.MetaInfo.UserTag != null)
                {
                    metaInfo.UserTag = new UserTag { TagName = dataDto.MetaInfo.UserTag.TagName, TagValue = dataDto.MetaInfo.UserTag.TagValue, UserId = _userRepository.GetCurrentUserId() };
                }
                dataDto.MetaInfo = metaInfo;

                await _geospatialContext.SpatialArea.AddAsync(dataDto);
            }

            await _geospatialContext.SaveChangesAsync();
            return _mapper.Map<GeoSpatialLayer>(dataDto);
        }

        public async Task<List<GeoSpatialLayer>> GetMyAreasAsync()
        {
            var userId = _userRepository.GetCurrentUserId();
            var spatialAreas = await _geospatialContext.SpatialArea
                                                        .Include(s => s.MetaInfo).ThenInclude(s => s.PublicTag)
                                                        .Include(s => s.MetaInfo).ThenInclude(s => s.UserTag)
                                                        .Where(s => s.UserId == userId && !s.Deleted)
                                                        .ToListAsync();
            var areas = _mapper.Map<List<GeoSpatialLayer>>(spatialAreas);

            return areas;
        }

        public async Task<List<GeoSpatialLayer>> GetAllAreasAsync()
        {
            var spatialAreas = await _geospatialContext.SpatialArea
                                                        .Include(s => s.MetaInfo).ThenInclude(s => s.PublicTag)
                                                        .Include(s => s.MetaInfo).ThenInclude(s => s.UserTag)
                                                        .Where(s => !s.Deleted)
                                                        .ToListAsync();
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

        public async Task<GeoLocation> AddLocationAsync(GeoLocation location)
        {
            var addressRecord = _mapper.Map<Address>(location);
            if (addressRecord.AddressId > 0)
            {
                var target = await _geospatialContext.Address.FirstAsync(a => a.AddressId == addressRecord.AddressId);
                target.FriendlyName = addressRecord.FriendlyName;
                target.FullAddress = addressRecord.FullAddress;
                target.GooglePayload = addressRecord.GooglePayload;
                target.Lat = addressRecord.Lat;
                target.Lng = addressRecord.Lng;
                target.What3words = addressRecord.What3words;
            }
            else
            {
               await _geospatialContext.Address.AddAsync(addressRecord);
            }

            await _geospatialContext.SaveChangesAsync(); 
            return _mapper.Map<GeoLocation>(addressRecord);
        }

        public async Task<List<GeoLocation>> GetLocationsAsync()
        {
            var data = await _geospatialContext.Address.ToListAsync();
            return _mapper.Map<List<GeoLocation>>(data);
        }
    }
}
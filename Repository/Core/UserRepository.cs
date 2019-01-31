

using AutoMapper;
using DomainModels.Settings;
using Microsoft.EntityFrameworkCore;
using Repository.Contract;
using Repository.DataContext;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Core
{
    public class UserRepository : IUserRepository
    {
        private readonly GeospatialContext _geospatialContext;
        private readonly IMapper _mapper;

        public UserRepository(GeospatialContext geospatialContext, IMapper mapper)
        {
            _geospatialContext = geospatialContext;
            _mapper = mapper;
        }

        public async Task<UserSettings> GetMySettingsAsync()
        {
            var settingRecords = await _geospatialContext.Setting.ToListAsync();
            return _mapper.Map<UserSettings>(settingRecords);
        }

        public async Task UpdateMySettingsAsync(UserSettings settings)
        {
            var targetSetting = await _geospatialContext.Setting.FirstOrDefaultAsync(s => s.SettingName == "DEFAULT_MAP_PROVIDER");
            if (targetSetting != null)
            {
                targetSetting.SettingValue = settings.DefaultMapProvider;
                await _geospatialContext.SaveChangesAsync();
            }
        }
    }
}

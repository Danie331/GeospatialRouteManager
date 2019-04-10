using AutoMapper;
using DomainModels;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Repository.Contract;
using Repository.DataContext;
using System.Threading.Tasks;
using System.Linq;

namespace Repository.Core
{
    public class UserRepository : IUserRepository
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly GeospatialContext _geospatialContext;
        private readonly IMapper _mapper;

        public UserRepository(IHttpContextAccessor httpContextAccessor,
                                GeospatialContext geospatialContext, 
                                IMapper mapper)
        {
            _httpContextAccessor = httpContextAccessor;
            _geospatialContext = geospatialContext;
            _mapper = mapper;
        }

        public async Task<User> GetUserAsync(string userLoginName)
        {
            var targetRecord = await _geospatialContext.User.FirstOrDefaultAsync(u => u.LoginName.ToLower() == userLoginName.ToLower());
            if (targetRecord != null)
            {
                var user = _mapper.Map<User>(targetRecord);
                var userSettings = await _geospatialContext.Setting.Where(s => s.UserId == user.UserId).ToListAsync();// NB.: User Id from DB for auth
                user.DefaultMapProvider = userSettings.FirstOrDefault(s => s.SettingName == "DEFAULT_MAP_PROVIDER")?.SettingValue ?? "google";
                user.UserRole = userSettings.FirstOrDefault(s => s.SettingName == "USER_ROLE")?.SettingValue ?? "user";

                return user;
            }

            return null;
        }

        public async Task UpdateMySettingsAsync(User userWithSettings)
        {
            var userId = int.Parse(_httpContextAccessor.HttpContext.User.Identity.Name);
            var targetSetting = await _geospatialContext.Setting.FirstOrDefaultAsync(s => s.UserId == userId &&
                                                                                    s.SettingName == "DEFAULT_MAP_PROVIDER");
            if (targetSetting != null)
            {
                targetSetting.SettingValue = userWithSettings.DefaultMapProvider;
                await _geospatialContext.SaveChangesAsync();
            }
        }
    }
}

using AutoMapper;
using DomainModels;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Repository.Contract;
using Repository.DataContext;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

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

        public int GetCurrentUserId()
        {
            var userId = int.Parse(_httpContextAccessor.HttpContext.User.Identity.Name);
            return userId;
        }

        public async Task<List<MetaTag>> GetUserTagsAsync()
        {
            var userId = int.Parse(_httpContextAccessor.HttpContext.User.Identity.Name);
            var tagRecords = await _geospatialContext.UserTag.Where(u => u.UserId == userId && u.TagValue != string.Empty)
                                                             .GroupBy(gr => gr.TagValue).Select(r => r.First()).ToListAsync();
            return _mapper.Map<List<MetaTag>>(tagRecords);
        }

        public async Task SaveUserTagsAsync(List<MetaTag> userTags)
        {
            var userId = int.Parse(_httpContextAccessor.HttpContext.User.Identity.Name);            
            var existingTags = await _geospatialContext.UserTag.Where(s => s.UserId == userId).ToListAsync();
            foreach (var tag in userTags)
            {
                // cases
                // 1. If incoming tag doesnt exist, create it
                // 2. If existing tag not one of incoming tags, delete it and nullify all layers associated
                var tagExists = existingTags.FirstOrDefault(t => t.TagValue.ToLower() == tag.TagValue.ToLower());
                if (tagExists == null)
                {
                    var dataTag = _mapper.Map<DataModels.UserTag>(tag);
                    dataTag.UserId = GetCurrentUserId();
                    await _geospatialContext.UserTag.AddAsync(dataTag);
                }
            }
            var tagsToRemove = existingTags.Where(t => !userTags.Any(t2 => t2.TagValue.ToLower() == t.TagValue.ToLower()));
            foreach (var item in tagsToRemove)
            {
                item.TagName = item.TagValue;
                item.TagValue = string.Empty;
            }

            await _geospatialContext.SaveChangesAsync();
        }
    }
}

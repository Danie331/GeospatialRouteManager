
using DomainModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Contract
{
    public interface IUserRepository
    {
        Task UpdateMySettingsAsync(User settings);
        Task<User> GetUserAsync(string loginName);
        int GetCurrentUserId();
        Task<List<MetaTag>> GetUserTagsAsync();
        Task SaveUserTagsAsync(List<MetaTag> userTags);
    }
}

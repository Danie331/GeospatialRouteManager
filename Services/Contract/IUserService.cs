
using DomainModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Contract
{
    public interface IUserService
    {
        Task UpdateMySettingsAsync(User userWithSettings);
        Task<User> AuthenticateAsync(Credentials credentials);
        Task<List<MetaTag>> GetMyTagsAsync();
        Task<List<MetaTag>> SaveMyTagsAsync(List<MetaTag> userTags);
    }
}

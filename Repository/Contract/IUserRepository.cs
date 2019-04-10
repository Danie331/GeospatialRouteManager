
using DomainModels;
using System.Threading.Tasks;

namespace Repository.Contract
{
    public interface IUserRepository
    {
        Task UpdateMySettingsAsync(User settings);
        Task<User> GetUserAsync(string loginName);
    }
}

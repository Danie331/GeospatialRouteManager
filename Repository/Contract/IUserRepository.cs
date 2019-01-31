
using DomainModels.Settings;
using System.Threading.Tasks;

namespace Repository.Contract
{
    public interface IUserRepository
    {
        Task<UserSettings> GetMySettingsAsync();
        Task UpdateMySettingsAsync(UserSettings settings);
    }
}

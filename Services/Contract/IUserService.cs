
using DomainModels.Settings;
using System.Threading.Tasks;

namespace Services.Contract
{
    public interface IUserService
    {
        Task<UserSettings> GetMySettingsAsync();
        Task UpdateMySettingsAsync(DomainModels.Settings.UserSettings settings);
        Task<bool> AuthenticateAsync(DomainModels.Credentials credentials);
    }
}

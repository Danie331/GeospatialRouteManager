
using DomainModels;
using System.Threading.Tasks;

namespace Services.Contract
{
    public interface IUserService
    {
        Task UpdateMySettingsAsync(DomainModels.User userWithSettings);
        Task<User> AuthenticateAsync(DomainModels.Credentials credentials);
    }
}



using System.Threading.Tasks;
using DomainModels;
using DomainModels.Settings;
using Repository.Contract;
using Services.Contract;

namespace Services.Core
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserSettings> GetMySettingsAsync()
        {
            return await _userRepository.GetMySettingsAsync();
        }        

        public async Task UpdateMySettingsAsync(UserSettings settings)
        {
            await _userRepository.UpdateMySettingsAsync(settings);
        }

        public Task<bool> AuthenticateAsync(Credentials credentials)
        {
            return Task.FromResult(credentials.Username == "adam" && credentials.Password == "qwerty123");
        }
    }
}

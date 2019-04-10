

using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using DomainModels;
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

        public async Task UpdateMySettingsAsync(User userWithSettings)
        {
            await _userRepository.UpdateMySettingsAsync(userWithSettings);
        }

        public async Task<User> AuthenticateAsync(Credentials credentials)
        {
            var user = await _userRepository.GetUserAsync(credentials.Username);
            if (user == null)
                return null;

            using (var sha = new SHA512Managed())
            {
                var inputText = Encoding.UTF8.GetBytes(credentials.Password);
                var textHash = sha.ComputeHash(inputText);

                var authResult = user.PasswordHash.SequenceEqual(textHash);
                return authResult ? user : null;
            }
        }
    }
}

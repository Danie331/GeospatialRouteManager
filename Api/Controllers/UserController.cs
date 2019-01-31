
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Services.Contract;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;

        public UserController(IUserService userService, IMapper mapper)
        {
            _userService = userService;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("mysettings")]
        public async Task<ApiDto.UserSettings> GetMySettings()
        {
            var settings = await _userService.GetMySettingsAsync();
            return _mapper.Map<ApiDto.UserSettings>(settings);
        }

        [HttpPost]
        [Route("updatesettings")]
        public async Task UpdateSettings(ApiDto.UserSettings settingsDto)
        {
            var userSettings = _mapper.Map<DomainModels.Settings.UserSettings>(settingsDto);
            await _userService.UpdateMySettingsAsync(userSettings);
        }
    }
}
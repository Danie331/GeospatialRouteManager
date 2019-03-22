
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Services.Contract;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Authorize]
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

        [HttpPost]
        [AllowAnonymous]
        [Route("login")]
        public async Task<IActionResult> Login([FromForm]ApiDto.Credentials credentialsDto)
        {
            var credentials = _mapper.Map<DomainModels.Credentials>(credentialsDto);
            var result = await _userService.AuthenticateAsync(credentials);
            if (!result)
            {
                return StatusCode(401);
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("Xp2s5v8x/A?D(G+KbPeShVmYq3t6w9z$B&E)H@McQfTjWnZr4u7x!A%D*F-JaNdR");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, credentialsDto.Username)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new ApiDto.User
            {
                Token = tokenString,
                Username = credentialsDto.Username
            });
        }
    }
}
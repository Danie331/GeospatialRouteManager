

using Newtonsoft.Json;

namespace Api.ApiDto
{
    public class User
    {
        [JsonProperty("Username")]
        public string Username { get; set; }
        [JsonProperty("Token")]
        public string Token { get; set; }
        [JsonProperty("UserId")]
        public int UserId { get; set; }
        [JsonProperty("DefaultMapProvider")]
        public string DefaultMapProvider { get; set; }
        [JsonProperty("UserRole")]
        public string UserRole { get; set; }
        [JsonProperty("FriendlyName")]
        public string FriendlyName { get; set; }
    }
}

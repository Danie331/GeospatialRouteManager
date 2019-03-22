

using Newtonsoft.Json;

namespace Api.ApiDto
{
    public class User
    {
        [JsonProperty("Username")]
        public string Username { get; set; }
        [JsonProperty("Token")]
        public string Token { get; set; }
    }
}

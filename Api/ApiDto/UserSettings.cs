

using Newtonsoft.Json;

namespace Api.ApiDto
{
    public class UserSettings
    {
        [JsonProperty("DefaultMapProvider")]
        public string DefaultMapProvider { get; set; }
    }
}

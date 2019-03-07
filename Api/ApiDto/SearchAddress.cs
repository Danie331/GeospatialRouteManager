using Newtonsoft.Json;

namespace Api.ApiDto
{
    public class SearchAddress
    {
        [JsonProperty("value")]
        public int AddressLocationId { get; set; }
        [JsonProperty("label")]
        public string FormattedAddress { get; set; }
    }
}
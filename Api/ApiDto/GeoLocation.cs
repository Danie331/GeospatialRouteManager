

using Newtonsoft.Json;
using System;

namespace Api.ApiDto
{
    public class GeoLocation
    {
        [JsonProperty("LocationId")]
        public int LocationId { get; set; }
        [JsonProperty("ProviderLocationId")]
        public string ProviderLocationId { get; set; }
        [JsonProperty("FormattedAddress")]
        public string FormattedAddress { get; set; }
        [JsonProperty("What3Words")]
        public string What3Words { get; set; }
        [JsonProperty("Lat")]
        public double Lat { get; set; }
        [JsonProperty("Lng")]
        public double Lng { get; set; }
        [JsonProperty("ProviderPayload")]
        public string ProviderPayload { get; set; }
        [JsonProperty("ValidatedDate")]
        public DateTime? ValidatedDate { get; set; }
    }
}

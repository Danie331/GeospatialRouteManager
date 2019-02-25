

using Newtonsoft.Json;

namespace ExternalServices.ServiceProviders.What3Words
{
    public class Result
    {
        [JsonProperty("words")]
        public string Words { get; set; }
        [JsonProperty("geometry")]
        public Geometry Geometry { get; set; }
        [JsonProperty("status")]
        public Status Status { get; set; }
    }
}

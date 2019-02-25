using Newtonsoft.Json;

namespace ExternalServices.ServiceProviders.What3Words
{
    public class Geometry
    {
        [JsonProperty("lat")]
        public double Lat { get; set; }
        [JsonProperty("lng")]
        public double Lng { get; set; }
    }
}
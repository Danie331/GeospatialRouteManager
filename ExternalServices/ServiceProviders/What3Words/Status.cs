

using Newtonsoft.Json;

namespace ExternalServices.ServiceProviders.What3Words
{
    public class Status
    {
        [JsonProperty("code")]
        public int Code { get; set; }
        [JsonProperty("message")]
        public string Message { get; set; }
        [JsonProperty("status")]
        public int status { get; set; }
        [JsonProperty("reason")]
        public string Reason { get; set; }
    }
}

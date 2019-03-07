
using Newtonsoft.Json;

namespace Api.ApiDto
{
    public class SearchSuburb
    {
        [JsonProperty("value")]
        public int SuburbId { get; set; }
        [JsonProperty("label")]
        public string FormattedName { get; set; }
    }
}

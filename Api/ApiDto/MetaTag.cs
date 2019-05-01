
using Newtonsoft.Json;

namespace Api.ApiDto
{
    public class MetaTag
    {
        [JsonProperty("TagName")]
        public string TagName { get; set; }
        [JsonProperty("TagValue")]
        public string TagValue { get; set; }
    }
}

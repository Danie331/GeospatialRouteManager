
using Newtonsoft.Json;

namespace Api.ApiDto
{
    public class GeoFeatureLayer
    {
        [JsonProperty("Id")]
        public int Id { get; set; }
        [JsonProperty("LayerName")]
        public string LayerName { get; set; }
        [JsonProperty("Geojson")]
        public object Geojson { get; set; }
        [JsonProperty("UserId")]
        public int UserId { get; set; }
        [JsonProperty("PublicTag")]
        public MetaTag PublicTag { get; set; }
        [JsonProperty("UserTag")]
        public MetaTag UserTag { get; set; }
    }
}

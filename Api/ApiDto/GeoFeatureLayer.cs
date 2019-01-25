
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
    }
}

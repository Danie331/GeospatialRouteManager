

namespace DomainModels.Geospatial
{
    public class GeoSpatialLayer
    {
        public int Id { get; set; }
        public string LayerName { get; set; }
        public string Geojson { get; set; }
    }
}

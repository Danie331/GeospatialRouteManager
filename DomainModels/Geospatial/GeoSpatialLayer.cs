

namespace DomainModels.Geospatial
{
    public class GeoSpatialLayer
    {
        public int Id { get; set; }
        public string LayerName { get; set; }
        public string Geojson { get; set; }
        public int UserId { get; set; }
        public MetaTag PublicTag { get; set; }
        public MetaTag UserTag { get; set; }
    }
}

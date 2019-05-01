
using GeoAPI.Geometries;

namespace Repository.DataModels
{
    public partial class SpatialArea
    {
        public int Id { get; set; }
        public IGeometry GeoPolygon { get; set; }
        public IGeometry AreaCenterPoint { get; set; }
        public string AreaName { get; set; }
        public bool Deleted { get; set; }
        public int UserId { get; set; }
        public int MetaInfoId { get; set; }

        public virtual LayerMetaInfo MetaInfo { get; set; }
        public virtual User User { get; set; }
    }
}

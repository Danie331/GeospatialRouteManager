
using GeoAPI.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataRepository.DataModels
{
    public partial class SpatialArea
    {
        public int Id { get; set; }

        public string AreaName { get; set; }

        [Column(TypeName = "geography")]
        public IGeometry Polygon { get; set; }
    }
}

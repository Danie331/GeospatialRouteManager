
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repository.DataModels
{
    public partial class SpatialArea
    {
        public int Id { get; set; }

        public string AreaName { get; set; }

        [Column(TypeName = "geography")]
        public Polygon Polygon { get; set; }
    }
}

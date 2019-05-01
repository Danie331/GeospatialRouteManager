
using System.Collections.Generic;

namespace Repository.DataModels
{
    public partial class LayerMetaInfo
    {
        public LayerMetaInfo()
        {
            SpatialArea = new HashSet<SpatialArea>();
        }

        public int Id { get; set; }
        public int PublicTagId { get; set; }
        public int? UserTagId { get; set; }

        public virtual PublicTag PublicTag { get; set; }
        public virtual UserTag UserTag { get; set; }
        public virtual ICollection<SpatialArea> SpatialArea { get; set; }
    }
}

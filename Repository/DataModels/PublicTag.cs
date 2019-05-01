
using System.Collections.Generic;

namespace Repository.DataModels
{
    public partial class PublicTag
    {
        public PublicTag()
        {
            LayerMetaInfo = new HashSet<LayerMetaInfo>();
        }

        public int Id { get; set; }
        public string TagName { get; set; }
        public string TagValue { get; set; }

        public virtual ICollection<LayerMetaInfo> LayerMetaInfo { get; set; }
    }
}

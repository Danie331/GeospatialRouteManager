
using System.Collections.Generic;

namespace Repository.DataModels
{
    public partial class UserTag
    {
        public UserTag()
        {
            LayerMetaInfo = new HashSet<LayerMetaInfo>();
        }

        public int Id { get; set; }
        public int UserId { get; set; }
        public string TagName { get; set; }
        public string TagValue { get; set; }

        public virtual User User { get; set; }
        public virtual ICollection<LayerMetaInfo> LayerMetaInfo { get; set; }
    }
}

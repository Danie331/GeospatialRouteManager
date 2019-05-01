using System;
using System.Collections.Generic;

namespace Repository.DataModels
{
    public partial class User
    {
        public User()
        {
            Setting = new HashSet<Setting>();
            SpatialArea = new HashSet<SpatialArea>();
            UserTag = new HashSet<UserTag>();
        }

        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserSurname { get; set; }
        public string LoginName { get; set; }
        public byte[] PasswordHash { get; set; }
        public DateTime UpdatedDate { get; set; }

        public virtual ICollection<Setting> Setting { get; set; }
        public virtual ICollection<SpatialArea> SpatialArea { get; set; }
        public virtual ICollection<UserTag> UserTag { get; set; }
    }
}

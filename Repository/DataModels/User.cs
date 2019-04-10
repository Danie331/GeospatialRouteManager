
using System;

namespace Repository.DataModels
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserSurname { get; set; }
        public string LoginName { get; set; }
        public byte[] PasswordHash { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}

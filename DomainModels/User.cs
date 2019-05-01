

namespace DomainModels
{
    public class User
    {
        public int UserId { get; set; }
        public string Token { get; set; }
        public string Username { get; set; }
        public string DefaultMapProvider { get; set; }
        public string UserRole { get; set; }
        public byte[] PasswordHash { get; set; }
        public string FriendlyName { get; set; }
    }
}

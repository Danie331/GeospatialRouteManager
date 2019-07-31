
namespace Repository.DataModels
{
    public partial class Address
    {
        public int AddressId { get; set; }
        public string FullAddress { get; set; }
        public decimal Lat { get; set; }
        public decimal Lng { get; set; }
        public string SsName { get; set; }
        public string SsUnit { get; set; }
        public string What3words { get; set; }
        public int? SuburbId { get; set; }
        public string FriendlyName { get; set; }
        public string GooglePayload { get; set; }
    }
}

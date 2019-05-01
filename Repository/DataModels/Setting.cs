
namespace Repository.DataModels
{
    public partial class Setting
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string SettingName { get; set; }
        public string SettingValue { get; set; }

        public virtual User User { get; set; }
    }
}

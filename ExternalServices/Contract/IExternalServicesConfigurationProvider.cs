
using System.Threading.Tasks;

namespace ExternalServices.Contract
{
    public interface IExternalServicesConfigurationProvider
    {
        Task<string> GetConfigSettingAsync(string settingName);
    }
}

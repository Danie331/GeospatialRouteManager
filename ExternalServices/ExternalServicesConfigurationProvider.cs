
using System;
using System.Threading.Tasks;
using ExternalServices.Contract;

namespace ExternalServices
{
    public class ExternalServicesConfigurationProvider : IExternalServicesConfigurationProvider
    {
        // TODO: find a safe place to store configuration values in the target environment
        public Task<string> GetConfigSettingAsync(string settingName)
        {
            switch(settingName)
            {
                case "w3w_key": return Task.FromResult("8TTK0AJJ");
                default: throw new ArgumentException(settingName);
            }
        }
    }
}



using ExternalServices.Contract;
using ExternalServices.ServiceProviders.What3Words;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ExternalServices
{
    public static class Dependencies
    {
        public static void RegisterExternalServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IExternalServicesConfigurationProvider, ExternalServicesConfigurationProvider>();

            services.AddScoped<IWhat3WordsProvider, What3WordsServiceProvider>();
        }
    }
}

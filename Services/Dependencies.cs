
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Services.Contract;
using Services.Core;

namespace Services
{
    public static class Dependencies
    {
        public static void RegisterServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IGeospatialService, GeospatialService>();
            services.AddScoped<IUserService, UserService>();

            Repository.Dependencies.RegisterRepository(services, configuration);
        }
    }
}

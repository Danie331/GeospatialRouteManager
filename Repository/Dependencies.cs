
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Repository.Contract;
using Repository.Core;
using Repository.DataContext;

namespace Repository
{
    public static class Dependencies
    {
        public static void RegisterRepository(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IGeospatialRepository, GeospatialRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddDbContext<GeospatialContext>(options =>
                    options.UseSqlServer(configuration.GetConnectionString("GeoSpatial"), x => x.UseNetTopologySuite()));
        }
    }
}

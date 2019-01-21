﻿using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Repository.Contract;
using Repository.Core;
using Repository.DataContext;
using System.Reflection;

namespace Repository
{
    public static class Dependencies
    {
        public static void RegisterRepository(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IGeospatialRepository, GeospatialRepository>();
            services.AddDbContext<GeospatialContext>(options =>
                    options.UseSqlServer(configuration.GetConnectionString("GeoSpatial"), x => x.UseNetTopologySuite()));
        }
    }
}

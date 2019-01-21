
using System.Configuration;
using DataRepository.Contract;
using DataRepository.DataModels;
using Microsoft.EntityFrameworkCore;

namespace DataRepository.DataContext
{
    public partial class GeospatialContext : DbContext, IGeospatialContext
    {
        public GeospatialContext()
        {
        }

        public GeospatialContext(DbContextOptions<GeospatialContext> options)
            : base(options)
        {
        }

        public virtual DbSet<SpatialArea> SpatialArea { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(ConfigurationManager.ConnectionStrings["Geospatial"].ConnectionString,
                                            x => x.UseNetTopologySuite());
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SpatialArea>(entity =>
            {
                entity.ToTable("spatial_area");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.AreaName)
                    .HasColumnName("area_name")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Polygon)
                .HasColumnName("geo_polygon")
                .HasColumnType("geography");
            });
        }
    }
}

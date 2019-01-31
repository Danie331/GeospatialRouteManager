
using Microsoft.EntityFrameworkCore;
using Repository.DataModels;

namespace Repository.DataContext
{
    public partial class GeospatialContext : DbContext
    {
        public GeospatialContext()
        {
        }

        public GeospatialContext(DbContextOptions<GeospatialContext> options)
            : base(options)
        {
        }

        public virtual DbSet<SpatialArea> SpatialArea { get; set; }

        public virtual DbSet<Setting> Setting { get; set; }

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

                entity.Property(e => e.GeoLayer)
                .HasColumnName("geo_polygon")
                .HasColumnType("geography");
            });

            modelBuilder.Entity<Setting>(entity =>
            {
                entity.ToTable("setting");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired(false);
                entity.Property(e => e.SettingName).HasColumnName("setting_name").HasMaxLength(255).IsUnicode(false);
                entity.Property(e => e.SettingValue).HasColumnName("setting_value");
            });
        }
    }
}

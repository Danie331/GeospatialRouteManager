
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

        public virtual DbSet<Suburb> Suburb { get; set; }

        public virtual DbSet<Address> Address { get; set; }

        public virtual DbSet<User> User { get; set; }

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

                entity.Property(e => e.Level)
                .HasColumnName("level");

                entity.Property(e => e.GeoLayer)
                .HasColumnName("geo_polygon")
                .HasColumnType("geography");

                entity.Property(e => e.Deleted)
                .HasColumnName("deleted");

                entity.Property(e => e.UserId)
                .HasColumnName("user_id");
            });

            modelBuilder.Entity<Setting>(entity =>
            {
                entity.ToTable("setting");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired(false);
                entity.Property(e => e.SettingName).HasColumnName("setting_name").HasMaxLength(255).IsUnicode(false);
                entity.Property(e => e.SettingValue).HasColumnName("setting_value");
            });

            modelBuilder.Entity<Address>(entity =>
            {
                entity.ToTable("address");

                entity.Property(e => e.AddressId).HasColumnName("address_id");

                entity.Property(e => e.FullAddress)
                    .IsRequired()
                    .HasColumnName("full_address")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Lat)
                    .HasColumnName("lat")
                    .HasColumnType("decimal(13, 8)");

                entity.Property(e => e.Lng)
                    .HasColumnName("lng")
                    .HasColumnType("decimal(13, 8)");

                entity.Property(e => e.SsName)
                    .HasColumnName("ss_name")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.SsUnit)
                    .HasColumnName("ss_unit")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.SuburbId).HasColumnName("suburb_id");

                entity.Property(e => e.What3words)
                    .HasColumnName("what3words")
                    .HasMaxLength(255)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Suburb>(entity =>
            {
                entity.ToTable("suburb");

                entity.Property(e => e.SuburbId).HasColumnName("suburb_id");

                entity.Property(e => e.LongName)
                    .IsRequired()
                    .HasColumnName("long_name")
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("user");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.UserName).HasColumnName("user_name");
                entity.Property(e => e.UserSurname).HasColumnName("user_surname");
                entity.Property(e => e.LoginName).HasColumnName("login_name");
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
                entity.Property(e => e.UpdatedDate).HasColumnName("updated_date");
            });
        }
    }
}

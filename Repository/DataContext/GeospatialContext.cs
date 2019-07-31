
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

        public virtual DbSet<Address> Address { get; set; }
        public virtual DbSet<LayerMetaInfo> LayerMetaInfo { get; set; }
        public virtual DbSet<PublicTag> PublicTag { get; set; }
        public virtual DbSet<Setting> Setting { get; set; }
        public virtual DbSet<SpatialArea> SpatialArea { get; set; }
        public virtual DbSet<Suburb> Suburb { get; set; }
        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<UserTag> UserTag { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.2-servicing-10034");

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

                entity.Property(e => e.FriendlyName)
                   .HasColumnName("friendly_name")
                   .HasMaxLength(255)
                   .IsUnicode(false);

                entity.Property(e => e.GooglePayload)
                    .HasColumnName("google_payload")
                    .IsUnicode(false);

            });

            modelBuilder.Entity<LayerMetaInfo>(entity =>
            {
                entity.ToTable("layer_meta_info");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.PublicTagId).HasColumnName("public_tag_id");

                entity.Property(e => e.UserTagId).HasColumnName("user_tag_id");

                entity.HasOne(d => d.PublicTag)
                    .WithMany(p => p.LayerMetaInfo)
                    .HasForeignKey(d => d.PublicTagId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("fk_layer_meta_info_public_tag");

                entity.HasOne(d => d.UserTag)
                    .WithMany(p => p.LayerMetaInfo)
                    .HasForeignKey(d => d.UserTagId)
                    .HasConstraintName("fk_layer_meta_info_user_tag");
            });

            modelBuilder.Entity<PublicTag>(entity =>
            {
                entity.ToTable("public_tag");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.TagName)
                    .IsRequired()
                    .HasColumnName("tag_name")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.TagValue)
                    .IsRequired()
                    .HasColumnName("tag_value")
                    .HasMaxLength(255)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Setting>(entity =>
            {
                entity.ToTable("setting");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.SettingName)
                    .IsRequired()
                    .HasColumnName("setting_name")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.SettingValue)
                    .IsRequired()
                    .HasColumnName("setting_value")
                    .IsUnicode(false);

                entity.Property(e => e.UserId).HasColumnName("user_id");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Setting)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK_user_id");
            });

            modelBuilder.Entity<SpatialArea>(entity =>
            {
                entity.ToTable("spatial_area");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.AreaCenterPoint)
                    .HasColumnName("area_center_point")
                    .HasComputedColumnSql("([geo_polygon].[EnvelopeCenter]())");

                entity.Property(e => e.AreaName)
                    .HasColumnName("area_name")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Deleted).HasColumnName("deleted");

                entity.Property(e => e.GeoPolygon).HasColumnName("geo_polygon");

                entity.Property(e => e.MetaInfoId).HasColumnName("meta_info_id");

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .HasDefaultValueSql("((1))");

                entity.HasOne(d => d.MetaInfo)
                    .WithMany(p => p.SpatialArea)
                    .HasForeignKey(d => d.MetaInfoId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("fk_spatial_area_layer_meta_info");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.SpatialArea)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__spatial_a__user___4316F928");
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

                entity.Property(e => e.LoginName)
                    .IsRequired()
                    .HasColumnName("login_name")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasColumnName("password_hash")
                    .HasMaxLength(64);

                entity.Property(e => e.UpdatedDate)
                    .HasColumnName("updated_date")
                    .HasColumnType("datetime");

                entity.Property(e => e.UserName)
                    .IsRequired()
                    .HasColumnName("user_name")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.UserSurname)
                    .IsRequired()
                    .HasColumnName("user_surname")
                    .HasMaxLength(255)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<UserTag>(entity =>
            {
                entity.ToTable("user_tag");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.TagName)
                    .IsRequired()
                    .HasColumnName("tag_name")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.TagValue)
                    .IsRequired()
                    .HasColumnName("tag_value")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.UserId).HasColumnName("user_id");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.UserTag)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("fk_user_tag_user");
            });
        }
    }
}

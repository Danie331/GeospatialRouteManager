using AutoMapper;
using DomainModels.Geospatial;
using DomainModels.Settings;
using GeoAPI.Geometries;
using NetTopologySuite;
using NetTopologySuite.Features;
using NetTopologySuite.IO;
using Repository.DataModels;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Linq;

namespace Repository
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DataModels.SpatialArea, DomainModels.Geospatial.GeoSpatialLayer>().ConvertUsing<DataToGeoJsonConvertor>();

            CreateMap<DomainModels.Geospatial.GeoSpatialLayer, DataModels.SpatialArea>().ConvertUsing<GeoJsonToDataConvertor>();

            CreateMap<List<DataModels.Setting>, DomainModels.Settings.UserSettings>().ConvertUsing<UserSettingsConvertor>();

            CreateMap<DataModels.Suburb, DomainModels.Geospatial.SearchSuburb>().ForMember(s => s.FormattedName, a => a.MapFrom(e => e.LongName));

            CreateMap<DataModels.Address, DomainModels.Geospatial.SearchAddress>().ForMember(s => s.AddressLocationId, a => a.MapFrom(e => e.AddressId))
                                                                                  .ForMember(s => s.FormattedAddress,
                                                                                    a => a.MapFrom(e => e.SsName != null ? $"{e.SsName} ({e.FullAddress})" : e.FullAddress));

            CreateMap<DataModels.Address, DomainModels.Geospatial.GeoLocation>().ForMember(s => s.LocationId, a => a.MapFrom(e => e.AddressId))
                                                                                .ForMember(s => s.FormattedAddress, 
                                                                                    a => a.MapFrom(e => e.SsName != null ? $"{e.SsName} ({e.FullAddress})" : e.FullAddress));
        }

        public class DataToGeoJsonConvertor : ITypeConverter<DataModels.SpatialArea, DomainModels.Geospatial.GeoSpatialLayer>
        {            
            public GeoSpatialLayer Convert(SpatialArea source, GeoSpatialLayer destination, ResolutionContext context)
            {
                var wktReader = new NetTopologySuite.IO.WKTReader();
                var geom = wktReader.Read(source.GeoLayer.AsText());              
                var sb = new StringBuilder();
                var serializer = NetTopologySuite.IO.GeoJsonSerializer.Create();
                var feature = new Feature(geom, new AttributesTable(new[] 
                {
                    new KeyValuePair<string, object>("Id", source.Id),
                    new KeyValuePair<string, object>("LayerColour", GetLayerColour(source.Level))
                }));
                serializer.Formatting = Newtonsoft.Json.Formatting.Indented;
                using (var sw = new StringWriter(sb))
                    serializer.Serialize(sw, feature);

                return new GeoSpatialLayer
                {
                    Id = source.Id,
                    LayerName = source.AreaName,
                    Level = source.Level,
                    Geojson = sb.ToString()
                };
            }

            private string GetLayerColour(int level)
            {
                switch (level)
                {
                    case 1: return "#FF333C";
                    case 2: return "#F6FF33";
                    case 3: return "#4FFF33";
                }
                return "red";
            }
        }

        public class GeoJsonToDataConvertor : ITypeConverter<DomainModels.Geospatial.GeoSpatialLayer, DataModels.SpatialArea>
        {
            public SpatialArea Convert(GeoSpatialLayer source, SpatialArea destination, ResolutionContext context)
            {
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var geoJsonReader = new GeoJsonReader(geometryFactory, new Newtonsoft.Json.JsonSerializerSettings());
                var feature = geoJsonReader.Read<Feature>(source.Geojson);
                IPolygon poly = feature.Geometry as IPolygon;
                if (poly != null && !poly.Shell.IsCCW)
                {
                    feature.Geometry = new NetTopologySuite.Geometries.Polygon((ILinearRing)poly.Shell.Reverse(), geometryFactory);
                } else
                {
                    feature.Geometry = new NetTopologySuite.Geometries.Polygon(poly.Shell, geometryFactory);
                }

                return new SpatialArea
                {
                    AreaName = source.LayerName,
                    Level = source.Level,
                    Id = source.Id,
                    GeoLayer = feature.Geometry
                };
            }
        }

        public class UserSettingsConvertor : ITypeConverter<List<DataModels.Setting>, DomainModels.Settings.UserSettings>
        {
            public UserSettings Convert(List<Setting> source, UserSettings destination, ResolutionContext context)
            {
                var defaultMapProvider = source.FirstOrDefault(s => s.SettingName == "DEFAULT_MAP_PROVIDER");
                return new UserSettings
                {
                    DefaultMapProvider = defaultMapProvider?.SettingValue
                };
            }
        }
    }
}

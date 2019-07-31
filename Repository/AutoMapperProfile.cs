using AutoMapper;
using DomainModels;
using DomainModels.Geospatial;
using GeoAPI.Geometries;
using NetTopologySuite;
using NetTopologySuite.Features;
using NetTopologySuite.IO;
using Repository.Contract;
using Repository.DataModels;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace Repository
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DataModels.SpatialArea, DomainModels.Geospatial.GeoSpatialLayer>().ConvertUsing<DataToGeoJsonConvertor>();

            CreateMap<DomainModels.Geospatial.GeoSpatialLayer, DataModels.SpatialArea>().ConvertUsing<GeoJsonToDataConvertor>();

            CreateMap<DataModels.User, DomainModels.User>().ForMember(s => s.FriendlyName, f => f.MapFrom(g => $"{g.UserName} {g.UserSurname}" ));

            CreateMap<DataModels.Suburb, DomainModels.Geospatial.SearchSuburb>().ForMember(s => s.FormattedName, a => a.MapFrom(e => e.LongName));

            CreateMap<DataModels.Address, DomainModels.Geospatial.SearchAddress>().ForMember(s => s.AddressLocationId, a => a.MapFrom(e => e.AddressId))
                                                                                  .ForMember(s => s.FormattedAddress,
                                                                                    a => a.MapFrom(e => e.SsName != null ? $"{e.SsName} ({e.FullAddress})" : e.FullAddress));

            CreateMap<DataModels.Address, DomainModels.Geospatial.GeoLocation>().ForMember(s => s.LocationId, a => a.MapFrom(e => e.AddressId))
                                                                                .ForMember(s => s.FormattedAddress, a => a.MapFrom(e => e.SsName != null ? $"{e.SsName} ({e.FullAddress})" : e.FullAddress))
                                                                                .ForMember(s => s.ProviderPayload, a => a.MapFrom(e => e.GooglePayload));

            CreateMap<DomainModels.Geospatial.GeoLocation, DataModels.Address>().ForMember(s => s.AddressId, a => a.MapFrom(e => e.LocationId))
                                                                               .ForMember(s => s.FullAddress, a => a.MapFrom(e => e.FormattedAddress))
                                                                               .ForMember(s => s.GooglePayload, a => a.MapFrom(e => e.ProviderPayload));

            CreateMap<DomainModels.MetaTag, DataModels.UserTag>().ReverseMap();//ConvertUsing<MetaToUserTagConvertor>();
            CreateMap<DomainModels.MetaTag, DataModels.PublicTag>().ReverseMap();
        }

        public class DataToGeoJsonConvertor : ITypeConverter<DataModels.SpatialArea, DomainModels.Geospatial.GeoSpatialLayer>
        {
            public GeoSpatialLayer Convert(SpatialArea source, GeoSpatialLayer destination, ResolutionContext context)
            {
                var wktReader = new NetTopologySuite.IO.WKTReader();
                var geom = wktReader.Read(source.GeoPolygon.AsText());
                var sb = new StringBuilder();
                var serializer = NetTopologySuite.IO.GeoJsonSerializer.Create();
                var publicTagValue = source.MetaInfo.PublicTag.TagValue;
                var feature = new Feature(geom, new AttributesTable(new[]
                {
                    new KeyValuePair<string, object>("Id", source.Id),
                    new KeyValuePair<string, object>("LayerColour", GetLayerColour(publicTagValue))
                }));
                serializer.Formatting = Newtonsoft.Json.Formatting.Indented;
                using (var sw = new StringWriter(sb))
                    serializer.Serialize(sw, feature);

                return new GeoSpatialLayer
                {
                    Id = source.Id,
                    LayerName = source.AreaName,
                    Geojson = sb.ToString(),
                    UserId = source.UserId,
                    PublicTag = context.Mapper.Map<MetaTag>(source.MetaInfo.PublicTag),
                    UserTag = context.Mapper.Map<MetaTag>(source.MetaInfo.UserTag)
                };
            }

            private string GetLayerColour(string publicTagValue)
            {
                switch (publicTagValue)
                {
                    case "1": return "#FF333C";
                    case "2": return "#F6FF33";
                    case "3": return "#4FFF33";
                }
                return "red";
            }
        }

        public class GeoJsonToDataConvertor : ITypeConverter<DomainModels.Geospatial.GeoSpatialLayer, DataModels.SpatialArea>
        {
            private readonly IUserRepository _userRepository;
            public GeoJsonToDataConvertor(IUserRepository userRepository)
            {
                _userRepository = userRepository;
            }

            public SpatialArea Convert(GeoSpatialLayer source, SpatialArea destination, ResolutionContext context)
            {
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var geoJsonReader = new GeoJsonReader(geometryFactory, new Newtonsoft.Json.JsonSerializerSettings());
                var feature = geoJsonReader.Read<Feature>(source.Geojson);
                IPolygon poly = feature.Geometry as IPolygon;
                if (poly != null && !poly.Shell.IsCCW)
                {
                    feature.Geometry = new NetTopologySuite.Geometries.Polygon((ILinearRing)poly.Shell.Reverse(), geometryFactory);
                }
                else
                {
                    feature.Geometry = new NetTopologySuite.Geometries.Polygon(poly.Shell, geometryFactory);
                }

                var userId = source.UserId != 0 ? source.UserId : _userRepository.GetCurrentUserId();
                var result = new SpatialArea
                {
                    AreaName = source.LayerName,
                    Id = source.Id,
                    GeoPolygon = feature.Geometry,
                    UserId = userId,
                     MetaInfo = new DataModels.LayerMetaInfo
                     {
                         PublicTag = context.Mapper.Map<PublicTag>(source.PublicTag),
                         UserTag = context.Mapper.Map<UserTag>(source.UserTag)
                     }
                };

                return result;
            }    
        }
    }
}

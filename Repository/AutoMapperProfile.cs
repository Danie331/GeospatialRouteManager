using AutoMapper;
using DomainModels.Geospatial;
using GeoAPI.Geometries;
using NetTopologySuite;
using NetTopologySuite.Features;
using NetTopologySuite.IO;
using Repository.DataModels;
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
        }

        public class DataToGeoJsonConvertor : ITypeConverter<DataModels.SpatialArea, DomainModels.Geospatial.GeoSpatialLayer>
        {            
            public GeoSpatialLayer Convert(SpatialArea source, GeoSpatialLayer destination, ResolutionContext context)
            {
                var wktReader = new NetTopologySuite.IO.WKTReader();
                var geom = wktReader.Read(source.GeoLayer.AsText());              
                var sb = new StringBuilder();
                var serializer = NetTopologySuite.IO.GeoJsonSerializer.Create();
                //var feature = new Feature(geom, new AttributesTable());
                serializer.Formatting = Newtonsoft.Json.Formatting.Indented;
                using (var sw = new StringWriter(sb))
                    serializer.Serialize(sw, geom/*feature*/);

                return new GeoSpatialLayer
                {
                    Id = source.Id,
                    LayerName = source.AreaName,
                    Geojson = sb.ToString()
                };
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
                    feature.Geometry = poly.Shell.Reverse();
                }
               
                return new SpatialArea
                {
                    AreaName = source.LayerName,
                    Id = source.Id,
                    GeoLayer = feature.Geometry
                };
            }
        }
    }
}

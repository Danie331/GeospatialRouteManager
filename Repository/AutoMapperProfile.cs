using AutoMapper;
using DomainModels.Geospatial;
using Repository.DataModels;
using System.IO;
using System.Text;

namespace Repository
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DataModels.SpatialArea, DomainModels.Geospatial.Area>().ConvertUsing<PolyGeoJsonConverter>();
        }

        public class PolyGeoJsonConverter : ITypeConverter<DataModels.SpatialArea, DomainModels.Geospatial.Area>
        {            
            public Area Convert(SpatialArea source, Area destination, ResolutionContext context)
            {
                var wktReader = new NetTopologySuite.IO.WKTReader();
                var geom = wktReader.Read(source.Polygon.AsText());              
                var sb = new StringBuilder();
                var serializer = NetTopologySuite.IO.GeoJsonSerializer.Create();
                serializer.Formatting = Newtonsoft.Json.Formatting.Indented;
                using (var sw = new StringWriter(sb))
                    serializer.Serialize(sw, geom);

                return new Area { PolyGeojson = sb.ToString() };
            }
        }
    }
}


using AutoMapper;
using DataRepository.Contract;
using DataRepository.DataContext;
using Ninject;
using Ninject.Modules;
using System.IO;
using System.Text;

namespace DataRepository
{
    public class Bindings : NinjectModule
    {
        public override void Load()
        {
            Bind<IGeospatialContext>().To<GeospatialContext>();

            var mapperConfiguration = CreateConfiguration();
            Bind<MapperConfiguration>().ToConstant(mapperConfiguration).InSingletonScope();
            // This teaches Ninject how to create automapper instances say if for instance
            // MyResolver has a constructor with a parameter that needs to be injected
            Bind<IMapper>().ToMethod(ctx => new Mapper(mapperConfiguration, type => ctx.Kernel.Get(type)));
        }

        private MapperConfiguration CreateConfiguration()
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(GetType().Assembly);
                cfg.CreateMap<DataModels.SpatialArea, DomainModels.Geospatial.Area>().ConvertUsing(new SpatialGeoJsonConverter());
            });

            return config;
        }
    }

    class SpatialGeoJsonConverter : ITypeConverter<DataModels.SpatialArea, DomainModels.Geospatial.Area>
    {
        public DomainModels.Geospatial.Area Convert(DataModels.SpatialArea source, DomainModels.Geospatial.Area destination, ResolutionContext context)
        {
            var wktReader = new NetTopologySuite.IO.WKTReader();
            var geom = wktReader.Read(source.Polygon.AsText());
            var feature = new NetTopologySuite.Features.Feature(geom, new NetTopologySuite.Features.AttributesTable());
            var featureCollection = new NetTopologySuite.Features.FeatureCollection();
            featureCollection.Add(feature);
            var sb = new StringBuilder();
            var serializer = NetTopologySuite.IO.GeoJsonSerializer.Create();
            serializer.Formatting = Newtonsoft.Json.Formatting.Indented;
            using (var sw = new StringWriter(sb))
                serializer.Serialize(sw, featureCollection);
            var result = sb.ToString();

            return new DomainModels.Geospatial.Area
            {
                Id = source.Id,
                AreaName = source.AreaName,
                GeoJson = result
            };
        }
    }
}
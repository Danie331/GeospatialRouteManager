using AutoMapper;

namespace Api
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DomainModels.Geospatial.SearchSuburb, ApiDto.SearchSuburb>();
            CreateMap<DomainModels.Geospatial.SearchAddress, ApiDto.SearchAddress>();
            CreateMap<ApiDto.Credentials, DomainModels.Credentials>().ForMember(s => s.Password, g => g.MapFrom(o => o.Pass));
            CreateMap<DomainModels.User, ApiDto.User>();
            CreateMap<ApiDto.User, DomainModels.User>();
            CreateMap<ApiDto.MetaTag, DomainModels.MetaTag>().ReverseMap();
            CreateMap<ApiDto.GeoLocation, DomainModels.Geospatial.GeoLocation>().ForMember(s => s.SsName, g => g.Ignore())
                                                                                .ForMember(s => s.SsUnit, g => g.Ignore()).ReverseMap();
        }
    }
}

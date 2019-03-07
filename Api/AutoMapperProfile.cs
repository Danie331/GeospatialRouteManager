using AutoMapper;

namespace Api
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DomainModels.Geospatial.SearchSuburb, ApiDto.SearchSuburb>();
            CreateMap<DomainModels.Geospatial.SearchAddress, ApiDto.SearchAddress>();
        }
    }
}

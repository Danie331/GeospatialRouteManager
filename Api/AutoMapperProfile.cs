using AutoMapper;

namespace Api
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<DomainModels.Geospatial.Area, ApiDto.Area>().ForMember(s => s.Poly, g => g.MapFrom(t => t.PolyGeojson));
        }
    }
}

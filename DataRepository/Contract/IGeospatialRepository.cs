
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataRepository.Contract
{
    public interface IGeospatialRepository
    {
        Task<List<DomainModels.Geospatial.Area>> GetAreasAsync();
    }
}

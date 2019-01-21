
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Contract
{
    public interface IGeospatialRepository
    {
        Task<List<DomainModels.Geospatial.Area>> GetAreasAsync();
    }
}

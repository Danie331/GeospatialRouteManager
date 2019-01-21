using DomainModels.Geospatial;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Contract
{
    public interface IGeospatialService
    {
        Task<List<Area>> GetAreasAsync();
    }
}

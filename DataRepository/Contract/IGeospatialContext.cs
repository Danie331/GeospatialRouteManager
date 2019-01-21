
using Microsoft.EntityFrameworkCore;

namespace DataRepository.Contract
{
    public interface IGeospatialContext
    {
        DbSet<DataModels.SpatialArea> SpatialArea { get; set; }
    }
}

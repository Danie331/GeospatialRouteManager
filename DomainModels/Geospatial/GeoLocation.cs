using System;

namespace DomainModels.Geospatial
{
    public class GeoLocation
    {
        public int LocationId { get; set; }
        public string ProviderLocationId { get; set; }
        public string FormattedAddress { get; set; }
        public string What3Words { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string SsName { get; set; }
        public string SsUnit { get; set; }
        public string ProviderPayload { get; set; }
        public string FriendlyName { get; set; }
        public DateTime? ValidatedDate { get; set; }
    }
}

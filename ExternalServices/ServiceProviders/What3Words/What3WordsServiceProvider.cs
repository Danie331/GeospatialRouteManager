

using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using DomainModels.Geospatial;
using ExternalServices.Contract;
using Newtonsoft.Json;

namespace ExternalServices.ServiceProviders.What3Words
{
    public class What3WordsServiceProvider : IWhat3WordsProvider
    {
        private readonly IExternalServicesConfigurationProvider _configProvider;

        public What3WordsServiceProvider(IExternalServicesConfigurationProvider configurationProvider)
        {
            _configProvider = configurationProvider;
        }

        public async Task<GeoLocation> ForwardGeocode(string words)
        {
            var apiKey = await _configProvider.GetConfigSettingAsync("w3w_key");
            var w3wUri = $"https://api.what3words.com/v2/forward?addr={ words }&display=full&format=json&key={ apiKey }";
            var request = (HttpWebRequest)WebRequest.Create(w3wUri);
            request.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

            using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
            using (Stream stream = response.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream))
            {
                var payload = await reader.ReadToEndAsync();
                var w3wResult = JsonConvert.DeserializeObject<Result>(payload);

                if (w3wResult.Status.status == 200)
                {
                    return new GeoLocation
                    {
                        What3Words = w3wResult.Words,
                        Lat = w3wResult.Geometry.Lat,
                        Lng = w3wResult.Geometry.Lng
                    };
                }
                else
                {
                    throw new Exception(JsonConvert.SerializeObject(w3wResult.Status));
                }
            }
        }

        public async Task<string> ReverseGeocode(double lat, double lng)
        {
            var apiKey = await _configProvider.GetConfigSettingAsync("w3w_key");
            var w3wUri = $"https://api.what3words.com/v2/reverse?coords={ lat },{ lng }&key={ apiKey }";
            var request = (HttpWebRequest)WebRequest.Create(w3wUri);
            request.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

            using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
            using (Stream stream = response.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream))
            {
                var payload = await reader.ReadToEndAsync();
                var w3wResult = JsonConvert.DeserializeObject<Result>(payload);

                if (w3wResult.Status.status == 200)
                {
                    return w3wResult.Words;
                }
                else
                {
                    throw new Exception(JsonConvert.SerializeObject(w3wResult.Status));
                }
            }
        }
    }
}

using Microsoft.AspNetCore.Builder;

namespace Api.Exceptions
{
    public static class Extensions
    {
        public static void ConfigureCustomExceptionMiddleware(this IApplicationBuilder app)
        {
            app.UseMiddleware<ExceptionMiddleware>();
        }
    }
}

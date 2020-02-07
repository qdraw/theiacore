using System;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace theiacore
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        public static string ConnectionString;
        public static string SessionToken;

        private void SetConnectionString()
        {
            ConnectionString = Environment.GetEnvironmentVariable("THEIACORE_APIKEY");

            // Session tokens
            SessionToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            SessionToken += Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            byte[] bytes = Encoding.ASCII.GetBytes(SessionToken);
            SessionToken = Encoding.ASCII.GetString(bytes);

            if (string.IsNullOrWhiteSpace(ConnectionString))
            {
                Console.WriteLine(">> connectionString from .json file");
                ConnectionString = Configuration.GetConnectionString("THEIACORE_APIKEY");
            }
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddSingleton<IFileProvider>(
                new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory())));

            if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), "uploads")))
            {
                Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "uploads"));
            }

            SetConnectionString();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseRouting();

            // Execute the matched endpoint.
            app.UseEndpoints(endpoints =>
            {
           	    endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
  	        });
        }
    }
}

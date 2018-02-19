using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using ObjectDetect;
using theiacore.Filters;
using theiacore.Helper;
using Microsoft.AspNetCore.Antiforgery;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace theiacore.Controllers
{
    public class ApiController : Controller
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        //private readonly IAntiforgery _antiforgery;

        public ApiController(IHostingEnvironment hostingEnvironment, IAntiforgery antiforgery)
        {
            _hostingEnvironment = hostingEnvironment;
            //_antiforgery = antiforgery;
        }


        [HttpPost]
        [DisableFormValueModelBinding]
        public async Task<IActionResult> Upload() 
        {

            if (!IsApikeyValid(Request)) return BadRequest("Authorisation Error");

            var guid = DateTime.UtcNow.ToString("yyyyddMM_HHmmss__") + Guid.NewGuid().ToString().Substring(0, 20) + ".jpg";
            var path = Path.Combine(_hostingEnvironment.ContentRootPath, "uploads", guid);
            using (var stream = System.IO.File.Create(path))
            {
                await Request.StreamFile(stream);
            }

            if (!ImageMeta.IsJpeg(path))
            {
                return BadRequest("please upload a jpeg file");
            } 

            var tensorObject = GetTensorObject.GetJsonFormat(path);

            if (IsKeyOptOutAnalytics(Request))
            {
                DeleteFile(guid);
            }
            return Json(tensorObject);
        }

        //private async void ValidateRequestHeader(HttpContext context)
        //{
        // Nice idea: but results in IOException: Unexpected end of Stream, the content may have already been read by another component.
        //    var q = await _antiforgery.IsRequestValidAsync(context);
        //}

        public static void DeleteFile(string fileName) {
            // Delete a file by using File class static method...
            if(System.IO.File.Exists(fileName))
            {
                // Use a try block to catch IOExceptions, to
                // handle the case of the file already being
                // opened by another process.
                try
                {
                    System.IO.File.Delete(fileName);
                }
                catch (IOException e)
                {
                    Console.WriteLine(e.Message);
                    //return;
                }
            }
        }


        public bool IsKeyOptOutAnalytics(Microsoft.AspNetCore.Http.HttpRequest request)
        {
            if ((Request.Headers["OPTOUTANALYTICS"].ToString() ?? "").Trim().Length > 0)
            {
                var apikey = Request.Headers["OPTOUTANALYTICS"].ToString().ToLower();
                return "true" == apikey;
            }
            else
            {
                return false;
            }
        }

        public bool IsApikeyValid(Microsoft.AspNetCore.Http.HttpRequest request)
        {
            if ((Request.Headers["APIKEY"].ToString() ?? "").Trim().Length > 0)
            {
                var connectionString = Startup.ConnectionString;

                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    return false;
                }
                var apikey = Request.Headers["APIKEY"].ToString();
                return connectionString == apikey;
            }
            else if((Request.Headers["x-csrf-token"].ToString() ?? "").Trim().Length > 0)
            {
                var sessionToken = Startup.SessionToken;

                if (string.IsNullOrWhiteSpace(sessionToken))
                {
                    return false;
                }
                var apikey = Request.Headers["x-csrf-token"].ToString();
                return sessionToken == apikey;
            }
            else
            {
                return false;
            }
        }

    }
}

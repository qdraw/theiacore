using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using ObjectDetect;
using theiacore.Filters;
using theiacore.Helper;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace theiacore.Controllers
{
    public class ApiController : Controller
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        public ApiController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }


        public async Task<IActionResult> Post(List<IFormFile> files)
        {
            long size = files.Sum(f => f.Length);

            // full path to file in temp location
            var filePath = Path.GetTempFileName();

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                }
            }

            // process uploaded files
            // Don't rely on or trust the FileName property without validation.

            return Ok(new {count = files.Count, size, filePath});
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadFile(IFormFile file)
        { 
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var guid = DateTime.UtcNow.ToString("yyyyddMM_HHmmss__") + Guid.NewGuid().ToString().Substring(0, 22) + ".jpg";

            if (file == null || file.Length == 0)
                return BadRequest("file not selected");

            var path = Path.Combine(
                Directory.GetCurrentDirectory(),
                guid);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            using (Image img = Image.FromFile(guid))
            {
                if (!img.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Jpeg))
                {
                    return BadRequest("wrong format");
                }
            }

            return Json(GetTensorObject.GetJsonFormat(guid));
        }


        [HttpPost]
        [DisableFormValueModelBinding]
        public async Task<IActionResult> Upload()
        {

            //FormValueProvider formModel;

            if (!IsApikeyValid(Request)) return BadRequest("Authorisation Error");

            // todo: check if jpg 
            // todo: check apikey

            var guid = DateTime.UtcNow.ToString("yyyyddMM_HHmmss__") + Guid.NewGuid().ToString().Substring(0, 20) + ".jpg";
            using (var stream = System.IO.File.Create(Path.Combine(_hostingEnvironment.ContentRootPath, guid)))
            {
                await Request.StreamFile(stream);
            }

            using (Image img = Image.FromFile(guid))
            {
                if (!img.RawFormat.Equals(System.Drawing.Imaging.ImageFormat.Jpeg))
                {
                    return BadRequest("wrong format");
                }
            }

            var tensorObject = GetTensorObject.GetJsonFormat(guid);

            if (IsKeyOptOutAnalytics(Request))
            {
                DeleteFile(guid);
            }
            return Json(tensorObject);

        }

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
                    return;
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
                //var bearer = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                var apikey = Request.Headers["APIKEY"].ToString();
                return "55Nz66yRiyz1gAGbBNh8Kw3GS0ocKGYEMR9VU1rpUhXclEMH8Xxomt3CnAaQnfj" == apikey;
            }
            else
            {
                return false;
            }
        }

    }
}

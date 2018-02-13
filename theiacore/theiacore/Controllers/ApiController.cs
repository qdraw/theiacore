using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

            return Json(GetTensorObject.GetJsonFormat(guid));
        }


        [HttpPost]
        [DisableFormValueModelBinding]
        public async Task<IActionResult> Upload()
        {

            //FormValueProvider formModel;


            // todo: check if jpg 
            // todo: check apikey

            var guid = DateTime.UtcNow.ToString("yyyyddMM_HHmmss__") + Guid.NewGuid().ToString().Substring(0, 20) + ".jpg";
            using (var stream = System.IO.File.Create(Path.Combine(_hostingEnvironment.ContentRootPath, guid)))
            {
                await Request.StreamFile(stream);
            }

            return Json(GetTensorObject.GetJsonFormat(guid));

        }
    }
}

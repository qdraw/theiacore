using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using theiacore.Models;
using theiacore.Filters;
using ObjectDetect;

namespace theiacore.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {

            
            //var stringList = objectdetect.ObjectDetect.GetJsonFormat().AsEnumerable();
            var stringList = ObjectDetect.Program.GetJsonFormat().AsEnumerable();
            //var stringList = new List<string>();
            return View(stringList);
        }


        [GenerateAntiforgeryTokenCookieForAjax]
        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

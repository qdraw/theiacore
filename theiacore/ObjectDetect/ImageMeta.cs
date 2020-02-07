using System;
using System.IO;
using System.Linq;
using System.Text;
using ObjectDetect.Models;

using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace ObjectDetect
{
    public class ImageMeta
    {
        public static bool IsJpeg(string filePath)
        {
            using (Image<Rgba32> image = Image.Load(filePath))
            {
                var height = image.Height;
                var width = image.Width;
                return height >= 1 && width >= 1;
            }
        }

        public static Dimensions GetJpegDimensions(string filePath)
        {
            using (Image<Rgba32> image = Image.Load(filePath))
            {
                var height = image.Height;
                var width = image.Width;
                return new Dimensions(width, height);
            }
        }
        
    }
}

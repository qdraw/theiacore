using System;
//using System.Drawing;
//using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.MetaData.Profiles.Exif;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace ObjectDetect
{
    /// <summary>
    /// Helper class for rotating images according the exif data.
    /// </summary>
    public static class ImageRotation
    {

        public static void RotateImageByExifOrientationData(string sourceFilePath, string targetFilePath)
        {
            using (Image<Rgba32> image = Image.Load(sourceFilePath))
            {
                image.Mutate(x => x.AutoOrient());
                image.Save(targetFilePath); // automatic encoder selected based on extension.
            }

        }

        public static int GetExifRotate(string sourceFilePath)
        {
            var exifString = "1";

            using (Image<Rgba32> image = Image.Load(sourceFilePath))
            {
                try
                {
                    var exifObject = image.MetaData.ExifProfile.GetValue(ExifTag.Orientation);
                    exifString = exifObject.Value.ToString();
                }
                catch (System.NullReferenceException)
                {
                }
            }

            var exifValue = int.Parse(exifString);
            return exifValue;
        }
    }
}

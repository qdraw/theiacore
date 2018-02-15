using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;

namespace ObjectDetect
{
    /// <summary>
    /// Helper class for manipulating images.
    /// </summary>
    public static class ImageRotation
    {

        public static RotateFlipType RotateImageByExifOrientationData(string sourceFilePath, string targetFilePath)
        {
            //(string sourceFilePath, string targetFilePath, ImageFormat targetFormat, bool updateExifData = true)

            return RotateImageByExifOrientationData(sourceFilePath, targetFilePath, ImageFormat.Jpeg);
        }


        /// <summary>
        /// Rotate the given image file according to Exif Orientation data
        /// </summary>
        /// <param name="sourceFilePath">path of source file</param>
        /// <param name="targetFilePath">path of target file</param>
        /// <param name="targetFormat">target format</param>
        /// <param name="updateExifData">set it to TRUE to update image Exif data after rotation (default is TRUE)</param>
        /// <returns>The RotateFlipType value corresponding to the applied rotation. If no rotation occurred, RotateFlipType.RotateNoneFlipNone will be returned.</returns>
        public static RotateFlipType RotateImageByExifOrientationData(string sourceFilePath, string targetFilePath, ImageFormat targetFormat, bool updateExifData = true)
        {
            // Rotate the image according to EXIF data
            var bmp = new Bitmap(sourceFilePath);
            RotateFlipType fType = RotateImageByExifOrientationData(bmp, updateExifData);
            if (fType != RotateFlipType.RotateNoneFlipNone)
            {
                bmp.Save(targetFilePath, targetFormat);
            }
            // close the file
            bmp.Dispose();
            return fType;
        }

        /// <summary>
        /// Rotate the given bitmap according to Exif Orientation data
        /// </summary>
        /// <param name="img">source image</param>
        /// <param name="updateExifData">set it to TRUE to update image Exif data after rotation (default is TRUE)</param>
        /// <returns>The RotateFlipType value corresponding to the applied rotation. If no rotation occurred, RotateFlipType.RotateNoneFlipNone will be returned.</returns>
        public static RotateFlipType RotateImageByExifOrientationData(Image img, bool updateExifData = true)
        {
            int orientationId = 0x0112;
            var fType = RotateFlipType.RotateNoneFlipNone;
            if (img.PropertyIdList.Contains(orientationId))
            {
                var pItem = img.GetPropertyItem(orientationId);
                fType = GetRotateFlipTypeByExifOrientationData(pItem.Value[0]);
                if (fType != RotateFlipType.RotateNoneFlipNone)
                {
                    img.RotateFlip(fType);
                    if (updateExifData) img.RemovePropertyItem(orientationId); // Remove Exif orientation tag
                }
            }
            return fType;
        }

        /// <summary>
        /// Return the image exif rotation as value to rotate the image in the browser
        /// </summary>
        /// <param name="sourceFilePath">Path of the jpeg image</param>
        /// <returns>Exif rotation value, nothing is 1. Different outputs are 3, 6 or 8</returns>
        public static int GetExifRotate(string sourceFilePath) {
            Image bmp = new Bitmap(sourceFilePath);

            const int orientationId = 0x0112;
            //var fType = RotateFlipType.RotateNoneFlipNone;
            var fType = 1;
            if (bmp.PropertyIdList.Contains(orientationId))
            {
                var pItem = bmp.GetPropertyItem(orientationId);
                fType = pItem.Value[0];
            }
            bmp.Dispose();
            return fType;
        }


            /// <summary>
            /// Return the proper System.Drawing.RotateFlipType according to given orientation EXIF metadata
            /// </summary>
            /// <param name="orientation">Exif "Orientation"</param>
            /// <returns>the corresponding System.Drawing.RotateFlipType enum value</returns>
        public static RotateFlipType GetRotateFlipTypeByExifOrientationData(int orientation)
        {
            switch (orientation)
            {
                //case 1:
                default:
                    return RotateFlipType.RotateNoneFlipNone;
                case 2:
                    return RotateFlipType.RotateNoneFlipX;
                case 3:
                    return RotateFlipType.Rotate180FlipNone;
                case 4:
                    return RotateFlipType.Rotate180FlipX;
                case 5:
                    return RotateFlipType.Rotate90FlipX;
                case 6:
                    return RotateFlipType.Rotate90FlipNone;
                case 7:
                    return RotateFlipType.Rotate270FlipX;
                case 8:
                    return RotateFlipType.Rotate270FlipNone;
            }
        }
    }
}

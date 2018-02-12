using System;
using System.Drawing;

namespace theia
{
    /// <summary>
    /// Allows to add graphic elements to the existing image.
    /// </summary>
    public class ImageEditor : IDisposable
    {
        private System.Drawing.Graphics _graphics;
        private System.Drawing.Image _image;
        private string _fontFamily;
        private float _fontSize;
        private string _outputFile;

        public ImageEditor(string inputFile, string outputFile, string fontFamily = "Ariel", float fontSize = 12)
        {
            if (string.IsNullOrEmpty(inputFile))
            {
                throw new ArgumentNullException(nameof(inputFile));
            }

            if (string.IsNullOrEmpty(outputFile))
            {
                throw new ArgumentNullException(nameof(outputFile));
            }

            _fontFamily = fontFamily;
            _fontSize = fontSize;
            _outputFile = outputFile;

            _image = Image.FromFile(inputFile);
            _graphics = Graphics.FromImage(_image);
        }

        /// <summary>
        /// Adds rectangle with a label in particular position of the image
        /// </summary>
        /// <param name="xmin"></param>
        /// <param name="xmax"></param>
        /// <param name="ymin"></param>
        /// <param name="ymax"></param>
        /// <param name="text"></param>
        /// <param name="colorName"></param>
        public void AddBox(float xmin, float xmax, float ymin, float ymax, string text = "")
        {
            var left = xmin * _image.Width;
            var right = xmax * _image.Width;
            var top = ymin * _image.Height;
            var bottom = ymax * _image.Height;

            Console.WriteLine(text);

            var imageRectangle = new Rectangle(new Point(0, 0), new Size(_image.Width, _image.Height));
            _graphics.DrawImage(_image, imageRectangle);

            //var color = System.Drawing.Color.Moccasin; // .FromName(colorName);
            //Brush brush = new SolidBrush ((Color)Color.MistyRose);
            //Pen pen = new Pen (brush);

            //_graphics.DrawRectangle (pen, left, top, right - left, bottom - top);
            //var font = new Font (_fontFamily, _fontSize);
            //SizeF size = _graphics.MeasureString (text, font);
            //_graphics.DrawString (text, font, brush, new PointF (left, top - size.Height));
        }

        public void Dispose()
        {
            if (_image != null)
            {
                _image.Save(_outputFile);

                if (_graphics != null)
                {
                    _graphics.Dispose();
                }

                _image.Dispose();
            }
        }
    }
}

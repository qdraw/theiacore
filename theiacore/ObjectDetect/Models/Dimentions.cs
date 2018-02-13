using System;
using System.Collections.Generic;
using System.Text;

namespace ObjectDetect.Models
{
    public class Dimensions
    {
        private readonly int width;
        private readonly int height;
        public Dimensions(int width, int height)
        {
            this.width = width;
            this.height = height;
        }
        public int Width
        {
            get { return width; }
        }
        public int Height
        {
            get { return height; }
        }
        public override string ToString()
        {
            return string.Format("width:{0}, height:{1}", Width, Height);
        }
    }
}

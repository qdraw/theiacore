using System;

namespace ObjectDetect.Models
{
    public class ImageMetaData
    {
        public string Keyword { get; set; }
        public int Class { get; set; }
        public float Left { get; set; }
        public float Right { get; set; }
        public float Top { get; set; }
        public float Bottom { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public float Score { get; set; }

    }
}
using System;
using System.Collections.Generic;
using System.Text;

namespace ObjectDetect.Models
{
    public class ImageMetaData
    {
        public string Name { get; set; }

        public int Results { get; set; }

        public Tuple<int, int> Dimensions{ get; set; }

    }
}

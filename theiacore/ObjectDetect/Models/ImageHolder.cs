using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ObjectDetect.Models
{
    public class ImageHolder
    {

        public ImageHolder()
        {
            Data = new List<ImageMetaData>();
            KeywordList = new HashSet<string>();
        }

        public string Name { get; set; }

        public int Results { get; set; }

        public Tuple<int, int> Dimensions{ get; set; }


        public HashSet<string> KeywordList { get; set; }

        public string Keywords
        {
            get
            {
                string keywords = "";
                var last = KeywordList.Last();

                foreach (var item in KeywordList)
                {
                    if (last == item)
                    {
                        keywords += item;
                    }
                    else
                    {
                        keywords += item + ", ";
                    }
                }
                return keywords;
            }
        }


        public int Orientation { get; set; }

        public List<ImageMetaData> Data { get; set; }

    }
}

﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ObjectDetect.Models;
using TensorFlow;

namespace ObjectDetect
{
    /// <summary>
    /// Get the Tensor values as json object
    /// </summary>
    public class GetTensorObject
    {
        private static IEnumerable<CatalogItem> _catalog;
        //private static string _input = "input.jpg";
        private static string _catalogPath = "mscoco_label_map_nl.pbtxt";
        private static string _modelPath = "ssd_mobilenet_v1_coco_2017_11_17.pb";
        private static double MIN_SCORE_FOR_OBJECT_HIGHLIGHTING = 0.65;

        /// <summary>
        /// Get the TensorFlow object detection data
        /// </summary>
        /// <param name="input">path of source file</param>
        /// <returns>Returns a ImageHolder object with all object data</returns>
        public static ImageHolder GetJsonFormat(string input)
        {

            var orientationValue = ImageRotation.GetExifRotate(input);
            ImageRotation.RotateImageByExifOrientationData(input, input);

            // A Catalog is a indexed file which descried the names of the objects
            _catalog = CatalogUtil.ReadCatalogItems(_catalogPath);
            string modelFile = _modelPath;

            // Load the model into the memory in place of the empty `TFGraph()`.
            using (var graph = new TFGraph())
            {
                var model = File.ReadAllBytes(modelFile);
                graph.Import(new TFBuffer(model));

                // Start a new session to do a numerical computation.
                using (var session = new TFSession(graph))
                {
                    // The variable input is a string with the path of the file.
                    // This is imported as a multidimensional array, this is also called a Tensor.
                    var tensor = ImageUtil.CreateTensorFromImageFile(input, TFDataType.UInt8);

                    // Use the runner class to easily configure inputs,
                    // outputs and targets to be passed to the session runner.
                    var runner = session.GetRunner();

                    runner
                        .AddInput(graph["image_tensor"][0], tensor)
                        .Fetch(
                            graph["detection_boxes"][0],
                            graph["detection_scores"][0],
                            graph["detection_classes"][0],
                            graph["num_detections"][0]);
                    var output = runner.Run();

                    // ReSharper disable once ArgumentsStyleLiteral
                    // ReSharper disable once RedundantArgumentDefaultValue
                    var boxes = (float[,,])output[0].GetValue(jagged: false);
                    // ReSharper disable once ArgumentsStyleLiteral
                    // ReSharper disable once RedundantArgumentDefaultValue
                    var scores = (float[,])output[1].GetValue(jagged: false);
                    // ReSharper disable once ArgumentsStyleLiteral
                    // ReSharper disable once RedundantArgumentDefaultValue
                    var classes = (float[,])output[2].GetValue(jagged: false);
                    //var num = (float[])output[3].GetValue(jagged: false);

                    // The boxes, scores and classes are arrays.
                    // I use GetBoxes to get the values of the objects from these arrays.

                    // Program.DrawBoxes(boxes, scores, classes, input, "test.jpg", MIN_SCORE_FOR_OBJECT_HIGHLIGHTING);

                    var getBoxes = GetBoxes(boxes, scores, classes, input, MIN_SCORE_FOR_OBJECT_HIGHLIGHTING);

                    getBoxes.Orientation = orientationValue;
                    getBoxes.Results = getBoxes.Data.Count;
                    return getBoxes;
                }
            }
        }

        /// <summary>
        /// Get the ImageHolder object with the width and height of the image and the boxes
        /// </summary>
        /// <param name="boxes">boxes tensor</param>
        /// <param name="scores">scores tensor</param>
        /// <param name="classes">classes tensor</param>
        /// <param name="inputFile">path of source file</param>
        /// <param name="minScore">min score 0-1</param>
        /// <returns>Returns a ImageHolder object with all object data</returns>
        private static ImageHolder GetBoxes(float[,,] boxes, float[,] scores, float[,] classes, string inputFile, double minScore)
        {
            //var boxesList = new List<ImageHolder>();

            var boxesList = new ImageHolder();
            boxesList.Dimensions = ImageMeta.GetJpegDimensions(inputFile);

            var x = boxes.GetLength(0);
            var y = boxes.GetLength(1);
            var z = boxes.GetLength(2);
            float ymin = 0, xmin = 0, ymax = 0, xmax = 0;

            for (int i = 0; i < x; i++)
            {
                for (int j = 0; j < y; j++)
                {
                    if (scores[i, j] < minScore) continue; // <
                    int value = Convert.ToInt32(classes[i, j]);
                    Console.WriteLine(value);

                    for (int k = 0; k < z; k++)
                    {
                        var box = boxes[i, j, k];
                        switch (k)
                        {
                            case 0:
                                ymin = box;
                                break;
                            case 1:
                                xmin = box;
                                break;
                            case 2:
                                ymax = box;
                                break;
                            case 3:
                                xmax = box;
                                break;
                        }
                    }

                    CatalogItem catalogItem = _catalog.FirstOrDefault(item => item.Id == value);

                    //Console.WriteLine(xmax);
                    //Console.WriteLine(ymax);
                    //Console.WriteLine(boxesList.Dimensions.Width);
                    //Console.WriteLine(boxesList.Dimensions.Height);



                    if (!string.IsNullOrEmpty(catalogItem?.DisplayName))
                    {
                        // Calculate the absolute width and height of a object
                        float left;
                        float right;
                        float top;
                        float bottom;

                        (left, right, top, bottom) =
                            (xmin * boxesList.Dimensions.Width, xmax * boxesList.Dimensions.Width,
                            ymin * boxesList.Dimensions.Height, ymax * boxesList.Dimensions.Height);

                        var boxesItem = new ImageMetaData
                        {
                            Keyword = catalogItem.DisplayName,
                            Class = catalogItem.Id,
                            Left = left,
                            Right = right,
                            Bottom = bottom,
                            Top = top,
                            Height = bottom - top,
                            Width = bottom - top,
                            Score = scores[i, j]
                        };
                        boxesList.Data.Add(boxesItem);
                        boxesList.KeywordList.Add(catalogItem.DisplayName);
                    }
                }
            }
            return boxesList;
        }


    }


}

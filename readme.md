## Note on security
- This example uses .NET Core 2.x please be aware that this might contains security issues

## How to see sharper with Tensorflow

With Tensorflow you can use Artificial Intelligence to to analyse images. In this blog post I’m going to do object detection with C# and Tensorflow. TensorFlow is an open source software library for numerical computation. With the technology of the most popular Deep learning framework is easy to use Tensorflow in different situations. In this example I use Tensorflow in combination with _.NET Core 2_

![Detecting two cars and a person](https://media.qdraw.nl/log//hoe-werkt-tensorflow-samen-met-microsoft-technologie/1000/001_20180219-demo-object-detection-city_kl1k.jpg)
_Detecting two cars and a person_


### An Artificial Intelligence project
In Theiacore I'm using two Visual Studio projects in one solution. Theiacore is used for serving webpages using the MVC Framework and ObjectDetect is for doing Artificial Intelligence. For Tensorflow there are bindings available for different languages. Python is the most popular binding. The most example you will find in Python. For C# there is [TensorflowSharp](https://github.com/migueldeicaza/TensorFlowSharp), this is a unofficial binding but works good for object detection.

For this example I'm focusing on using a Machine learning model for object detection. This is trained on Microsoft COCO.  The name COCO stands for _Common objects in context_ is a large-scale object detection, segmentation with 90 categories.

### ObjectDetect
I'm using the ObjectDetect-project for doing Artificial Intelligence. The goal is to retrieve the object data from the images. Using code snippets I will explain how this works.

Let's start with a blank canvas. In Tensorflow this is a empty `TFGraph()`. There are two things stored inside a `TFGraph()`. The first thing that's stored is the graph structure and the second are graph collections. In [How to train a Tensorflow face object detection model](https://towardsdatascience.com/how-to-train-a-tensorflow-face-object-detection-model-3599dcd0c26f) I create and store a frozen model. This model needs to be loaded in the graph, this is the memory of your computer.

```cs
public static ImageHolder GetJsonFormat(string input) {

	var list = new List<string>();
```
A Catalog is a indexed file which described the names of the objects. This file is called ` mscoco_label_map.pbtxt`
```cs
	_catalog = CatalogUtil.ReadCatalogItems(_catalogPath);
	string modelFile = _modelPath;

	using (var graph = new TFGraph()) {
```
Load the frozen model into the memory. We use the format `TFGraph()` to store the model data and the metadata into the memory.
```cs
		var model = File.ReadAllBytes(modelFile);
		graph.Import(new TFBuffer(model));
```
Start a new session to do a numerical computation. This is the session to do the object detection.
```cs
		using (var session = new TFSession(graph)) {
```
The variable `input` is a string with the path of the image. This is imported as a multidimensional array, this is also called a Tensor.
```cs
			var tensor = ImageUtil.CreateTensorFromImageFile(input, TFDataType.UInt8);
```
Use the `runner` class to easily configure inputs, outputs and targets to be passed to the session runner.
```cs
			var runner = session.GetRunner();
			runner
				.AddInput(graph["image_tensor"][0], tensor)
				.Fetch(
					graph["detection_boxes"][0],
					graph["detection_scores"][0],
					graph["detection_classes"][0],
					graph["num_detections"][0]);
			var output = runner.Run();

			var boxes = (float[,,])output[0].GetValue(jagged: false);
			var scores = (float[,])output[1].GetValue(jagged: false);
			var classes = (float[,])output[2].GetValue(jagged: false);
			var num = (float[])output[3].GetValue(jagged: false);
```
The boxes, scores and classes are arrays. I use GetBoxes to get the values of the objects from these arrays.
```cs
			var getBoxes = GetBoxes(boxes, scores, classes, input, 0.5);
			return getBoxes;
		}
	}
}
```
### Get the complete solution working
The source code of the entire project is public available, so you can find out how I’ve done object detection in C#. Therefore you need to follow the installation steps.

![Detecting two cars and a person](https://media.qdraw.nl/log/hoe-werkt-tensorflow-samen-met-microsoft-technologie/embed/002_20180219-demo-object-detection-train.gif)

_Whoop, whoop, this is the result_

### Installation steps
Tensorflow requires that you using a x64 runtime, by default is the .NET Core SDK x64. If you are using a x86 version, please switch to 64-bits. If you are planning to use Azure webapp this is by default a x86 dotnet runtime.


#### 1. Clone repository
The first step is to download the repository with git from GitHub.
```sh
$ git clone "https://github.com/qdraw/theiacore"
```
#### 2. Download the Pre trained Tensorflow Model and labels
The frozen models are not included in the Github repository, please download this three files and copy those to `theiacore/ObjectDetect`:
-   [mscoco_label_map.pbtxt](https://github.com/qdraw/theiacore/releases/download/0.1/mscoco_label_map.pbtxt)
-   [mscoco_label_map_nl.pbtxt](https://github.com/qdraw/theiacore/releases/download/0.1/mscoco_label_map_nl.pbtxt)
-   [ssd_mobilenet_v1_coco_2017_11_17.pb](https://github.com/qdraw/theiacore/releases/download/0.1/ssd_mobilenet_v1_coco_2017_11_17.pb)

Copy those files to `theiacore/ObjectDetect`

#### 3. Download _Reference assemblies_

The Libtensorflow is platform dependent and for production build (for example the azure build script) it is necessary to add the libtensorflow assemblies to the `theiacore/theiacore` folder.

__List of Libtensorflow downloadurls based on platform:__
-   _Windows:_
    -	[libtensorflow.dll](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.dll)
-   _Mac OS:_
    -	[libtensorflow.dylib](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.dylib)
    -	[libtensorflow_framework.dylib](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow_framework.dylib)
-   _Linux:_
    -	[libtensorflow.so](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.so)
    -	[libtensorflow_framework.so](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow_framework.so)

#### Azure web apps
If you are planning to use Azure webapp this is by default a x86 dotnet runtime. In the repository you will find `build-for-azure-x64.sh` The trick is to copy the files inside `/theiacore/theiacore/theiacore/bin/release/netcoreapp2.0/win-x64/publish` to the `wwwroot` of the Azure webapp.


#### 4. Let's run Theiacore
```sh
$ cd theiacore/theiacore
$ dotnet run
Now listening on: http://localhost:63884
```

Should the world of Computer Vision interest you, but you still do not know how to apply this and have the necessary questions? [Send me an email then we can have a cup of coffee.](https://qdraw.nl/contact.html)

## Hoe werkt Tensorflow samen met Microsoft Technologie
Met Tensorflow en Artificial Intelligence het is mogelijk om afbeeldingen realtime te analyseren. In deze blogpost ga ik objecten detecteren in afbeeldingen met Tensorflow en C#. TensorFlow is een open source library voor wiskundige berekeningen. Door gebruik te maken van TensorFlow, het meest populaire deep learning framework, is het mogelijk om dit framework in te zetten voor verschillende doeleinden. In dit voorbeeld gebruik ik Tensorflow in combinatie met _.NET Core 2_
![Detecting two cars and a person](https://apollo.qdraw.eu/temp/001_20180219-demo-object-detection-city.jpg)
_Detecteer twee auto’s en een persoon_
### Een Artificial Intelligence project
In Theiacore gebruik ik twee Visual Studio projecten in één solution. Theiacore wordt gebruikt voor het genereren van webpagina’s. Ik heb gebruik het MVC Framework voor het  genereren van webpagina’s. ObjectDetect wordt gebruikt voor het Artificial Intelligence gedeelte. Voor Tensorflow zijn er bindings (een koppeling tussen twee frameworks) beschikbaar voor verschillende programmeertalen. Python is de meest populaire binding en hiervoor zijn de meeste online voorbeelden beschikbaar. Voor de programmeertaal C# is er [TensorflowSharp](https://github.com/migueldeicaza/TensorFlowSharp), dit is een onofficiële binding die goed werkt voor object detection.
In dit voorbeeld focus ik mij op het gebruiken van een Machine learning model voor object herkenning. Dit model is getraind op Microsoft COCO. Deze dataset wordt gebruikt voor het herkennen van objecten in 90 verschillende categorieën.
### ObjectDetect-project
Ik gebruik het ObjectDetect-project om door middel van Artificial Intelligence data te verzamelen over de afbeeldingen. In de volgende code snippets zal ik toelichten hoe dit werkt.
Laten we beginnen met een blank canvas. In Tensorflow is dit een leeg `TFGraph()`. In een `TFGraph()` worden er twee dingen opgeslagen. Het eerste item is een structuur en het tweede is de graph zelf. Een graph zijn de learnings van het deeplearing framework. In [Train een tensorflow gezicht object detectie model](https://qdraw.nl/blog/design/train-een-tensorflow-gezicht-object-detectie-model/) leg ik uit hoe je het beste zelf een model kunt trainen en deze kan opslaan als frozen-model. Dit model wordt geladen in de graph. De graph is het geheugen van je computer.
```cs
public static ImageHolder GetJsonFormat(string input) {
var list = new List<string>();
```
Een Catalog is een geïndexeerd bestand waarin de namen van de objecten staan uitgeschreven. Het bestand heet: ` mscoco_label_map.pbtxt`
```cs
 _catalog = CatalogUtil.ReadCatalogItems(_catalogPath);
 string modelFile = _modelPath;
using (var graph = new TFGraph()) {
```
Het frozen model wordt ingeladen in het geheugen. Ik gebruik `TFGraph()` om de data en de metadata van het model in het geheugen te laden.
```cs
 var model = File.ReadAllBytes(modelFile);
 graph.Import(new TFBuffer(model));
```
Start een nieuwe sessie om de wiskundige berekeningen uit te voeren. In deze sessie worden de objecten herkenend.
```cs
 using (var session = new TFSession(graph)) {
```
De variabel `input` in een string met een link naar de locatie van de afbeelding. Deze wordt geimporteerd als multidimensionale array, wat ook wel een Tensor wordt genoemd.
```cs
 var tensor = ImageUtil.CreateTensorFromImageFile(input, TFDataType.UInt8);
```
Met de `runner` wordt het mogelijk om het algoritme te tweaken. Zo is het mogelijk om de inputs, outputs en te configureren.
```cs
 var runner = session.GetRunner();
 runner
 .AddInput(graph[“image_tensor”][0], tensor)
 .Fetch(
 graph[“detection_boxes”][0],
 graph[“detection_scores”][0],
 graph[“detection_classes”][0],
 graph[“num_detections”][0]);
 var output = runner.Run();
var boxes = (float[,,])output[0].GetValue(jagged: false);
 var scores = (float[,])output[1].GetValue(jagged: false);
 var classes = (float[,])output[2].GetValue(jagged: false);
 var num = (float[])output[3].GetValue(jagged: false);
```
De `boxes`, `scores` and `classes` zijn arrays en ik gebruik `GetBoxes` om de waardes over de objecten uit deze arrays te krijgen.
```cs
 var getBoxes = GetBoxes(boxes, scores, classes, input, 0.5);
 return getBoxes;
 }
 }
}
```
### Krijg de complete solution werkend.
De broncode van het complete project is publiek beschikbaar, zo kun je exact zien hoe ik het opgelost heb. De volgende stappen ben je nodig om dit project werkend te krijgen.
![Detecting two cars and a person](https://apollo.qdraw.eu/temp/002_20180219-demo-object-detection-train.gif)
_Whoop, whoop, dit is het resultaat_
### Installation steps
Tensorflow vereist dat je een _x64 runtime_ gebruikt. De .NET Core SDK is standaard x64. Wanneer je een x86 (32-bits) versie gebruikt switch s.v.p. eerst naar een 64-bits versie. Als je van plan bent om Azure webapps te gebruiken, deze zijn bij default 32-bits.
#### 1. Clone repository
De eerste stap om de repository te downloaden vanuit GitHub.
```sh
$ git clone "https://github.com/qdraw/theiacore"
```
#### 2. Download de Pretrained Tensorflow Model en labels
De frozen-models zijn niet ingesloten in de Github repository. Download en plaats deze bestanden in de map: `theiacore/ObjectDetect`:
- [mscoco_label_map.pbtxt](https://github.com/qdraw/theiacore/releases/download/0.1/mscoco_label_map.pbtxt)
- [mscoco_label_map_nl.pbtxt](https://github.com/qdraw/theiacore/releases/download/0.1/mscoco_label_map_nl.pbtxt)
- [ssd_mobilenet_v1_coco_2017_11_17.pb](https://github.com/qdraw/theiacore/releases/download/0.1/ssd_mobilenet_v1_coco_2017_11_17.pb)
En kopieer deze bestanden naar de map: `theiacore/ObjectDetect`
#### 3. Download _Reference assemblies_
De Libtensorflow is platform afhankelijk en voor het draaien op bijvoorbeeld een Azure is het nodig dat deze assemblies los worden toegevoegd in de map: `theiacore/theiacore`
__List of Libtensorflow downloadurls based on platform:__
- _Windows:_
 — [libtensorflow.dll](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.dll)
- _Mac OS:_
 — [libtensorflow.dylib](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.dylib)
 — [libtensorflow_framework.dylib](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow_framework.dylib)
- _Linux:_
 — [libtensorflow.so](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.so)
 — [libtensorflow_framework.so](https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow_framework.so)
#### Azure web apps
Als je van plan bent om dit project binnen een Azure webapp te gebruiken. Azure webapp draaien .Net Core draait standaard in x86 mode. In de repository is `build-for-azure-x64.sh` te vinden. Draai het buildscript en de truck is om de bestanden `/theiacore/theiacore/theiacore/bin/release/netcoreapp2.0/win-x64/publish` te kopieren naar de `wwwroot` binnen de Azure webapp. Start de webapp en het werkt.
#### 4. Start Theiacore
```sh
$ cd theiacore/theiacore
$ dotnet run
Now listening on: http://localhost:63884
```
 Mocht de wereld van Computer Vision je interesse hebben gewekt, maar weet je nog niet hoe je dit kunt toepassen en heb je de nodige vragen? [Stuur mij dan een mailtje dan kunnen we een kopje koffie drinken.](https://qdraw.nl/contact.html)

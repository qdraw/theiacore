
1) Clone repository
git clone "https://github.com/qdraw/theiacore"

2) Download Pretrained Tensorflow Model and labels
The models are not include in the repository
https://github.com/qdraw/theiacore/releases/download/0.1/mscoco_label_map.pbtxt
https://github.com/qdraw/theiacore/releases/download/0.1/mscoco_label_map_nl.pbtxt
https://github.com/qdraw/theiacore/releases/download/0.1/ssd_mobilenet_v1_coco_11_06_2017.pb

Copy those files to theiacore/ObjectDetect

3) Download Reference assemblies and place those in theiacore/theiacore

Windows:
https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.dll

Mac:
https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.dylib
https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow_framework.dylib

Linux:
https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow.dylib
https://github.com/qdraw/theiacore/releases/download/0.1/libtensorflow_framework.dylib

4) Let's see sharper with Tensorflow

cd theiacore/theiacore
dotnet run
Now listening on: http://localhost:63884

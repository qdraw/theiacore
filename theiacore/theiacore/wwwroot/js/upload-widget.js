
Dropzone.autoDiscover = false;

document.addEventListener("DOMContentLoaded", function(event){



	var dimensions = [];


    uploadWidget();

	function uploadWidget() {

		var uploader = new Dropzone('#upload-widget', {
			paramName: 'file',
			maxFilesize: 6, // MB
			maxFiles: 1,
			thumbnailWidth: 1000,
			thumbnailHeight: null,
			// dictDefaultMessage: 'Click or drag an image to start',
			dictDefaultMessage: 'Voeg hier je foto toe',

			headers: {
				'x-csrf-token': document.querySelectorAll('meta[name=csrf-token]')[0].getAttributeNode('content').value,
			},
			acceptedFiles: 'image/jpeg',
			accept: function(file, done) {
				file.acceptDimensions = done;
				file.rejectDimensions = function() {
					done('The image must be at least 640 x 480px')
				};
			}
		});
		uploader.on('addedfile', function( file){

			// document.querySelector("#welcome").innerHTML = "We are downloading your photo";
			document.querySelector("#welcome").innerHTML = "We downloaden je foto";
			document.querySelector("#info").innerHTML = "";
			document.querySelector("#upload-widget").style.backgroundColor = "rgb(28,38,50)";

			console.log(file);
			// start upload
		});

		// uploader.on("sending", function(file, xhr, formData) {
		// 	// formData.append("bearer", file.height);
		// 	// formData.append("width", file.width);
		// });

		uploader.on('thumbnail', function(file, dataUrl) {
			// console.log(dataUrl);
			if ( file.width < 640 || file.height < 480 ) {
				file.rejectDimensions();
			}
			if ( file.width >= 640 || file.height >= 480 ) {
				file.acceptDimensions();
			}
		});

		uploader.on('success', function( file, resp ){

			dimensions = resp.dimensions;

			document.querySelector(".dz-success-mark").style.display = "none";

			//rotateImage(document.querySelector(".dz-image > img:nth-child(1)").src, resp.orientation, function (base64) {
			//	document.querySelector(".dz-image > img:nth-child(1)").src = base64;
			//	initD3();
			//});

			// document.querySelector("#welcome").innerHTML = "Get ready!";
            document.querySelector("#welcome").innerHTML = "Nog even geduld!";

		    showData(resp);

		});
	}

	

	function rotateImage(srcBase64, srcOrientation, callback) {
		var img = new Image();

  		img.onload = function() {
			var width = img.width,
			height = img.height,
			canvas = document.createElement('canvas'),
			ctx = canvas.getContext("2d");

			// set proper canvas dimensions before transform & export
			if (4 < srcOrientation && srcOrientation < 9) {
				canvas.width = height;
				canvas.height = width;
			} else {
				canvas.width = width;
				canvas.height = height;
			}

			// transform context before drawing image
			switch (srcOrientation) {
				case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
				case 3: ctx.transform(-1, 0, 0, -1, width, height ); break;
				case 4: ctx.transform(1, 0, 0, -1, 0, height ); break;
				case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
				case 6: ctx.transform(0, 1, -1, 0, height , 0); break;
				case 7: ctx.transform(0, -1, -1, 0, height , width); break;
				case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
				default: break;
			}

			// draw image
			ctx.drawImage(img, 0, 0);

			// export base64
			callback(canvas.toDataURL());
		};

		img.src = srcBase64;
	}



    var isCognitiveReady = true;




	function initD3() {
		moveUploader();
		function moveUploader() {
			document.querySelector("#upload-widget").style.display = "none";
			var img = document.createElement('img')
			img.src = document.querySelector(".dz-image > img:nth-child(1)").src
			document.querySelector('#image').appendChild(img);
			document.querySelector("#image").style.display = "block";
		}

		// Start D3
		var svg = d3.select("#image").append("svg")
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 " + dimensions.width + " " + dimensions.height);

			var points = [
				"pupilLeft",
				"pupilRight",
				"mouthLeft",
				"mouthRight",
				"noseTip",
				"underLipTop",
			]


			for (var i = 0; i < points.length; i++) {
				var circle = svg.append("circle")
					.transition()
					.attr("id", points[i])
					.attr("cx", Math.random() * dimensions.width)
					.attr("cy", Math.random() * dimensions.height)
					.attr("r", "30")
					.style("fill", "rgba(255,255,255,0.8)")
					.on("end", function (d,i) {
						moveElementsThoughScreen(this.id)
					});
			}

			function moveElementsThoughScreen(id) {
			    d3.select("#" + id).transition().duration(500)
			        .attr("cx", Math.random() * dimensions.width) // change this to random 2px
			    	.attr("cy", Math.random() * dimensions.height) // change this to random 2px
					.attr("r", (Math.random() * 30) + 10)
					.on("end", function (d) {
						if (!isCognitiveReady) {
							moveElementsThoughScreen(this.id)
						}
					});
			}//e/my

			var square = svg.append("rect")
				.transition()
				.attr("id", "facerect")
				.attr("x", (Math.random() * dimensions.width) )
				.attr("y", (Math.random() * dimensions.width))
				.attr("width", (Math.random() * dimensions.width))
				.attr("height", (Math.random() * dimensions.width) )
				.attr('fill', "none")
				.style("stroke-width", ((Math.random() * 30) + 2) )
				.attr('stroke', '#fff')
				.on("end", function (d) {
					moveRectThoughScreen(this.id)
				});

			function moveRectThoughScreen(id) {
			    d3.select("#" + id).transition().duration(500)
					.attr("x", (Math.random() * dimensions.width) )
					.attr("y", (Math.random() * dimensions.width))
					.attr("width", (Math.random() * dimensions.width))
					.attr("height", (Math.random() * dimensions.width) )
					.style("stroke-width", ((Math.random() * 30) + 2) )
					.on("end", function (d) {
						if (!isCognitiveReady) {
							moveRectThoughScreen(this.id)
						}
					});
			}//e/my


	}



    function showData(response) {

        console.log(response);

		var points = [
			"pupilLeft",
			"pupilRight",
			"mouthLeft",
			"mouthRight",
			"noseTip",
			"underLipTop",
		]


		if (response.length === 0) {

			for (var j = 0; j < points.length; j++) {
				d3.select("#" + points[j]).transition().duration(500)
					.attr("r", 0)
			}
			d3.select("#facerect").transition().duration(500)
				.style("stroke-width", 0)

		}


		if (response.length >= 1) {

			var svg = d3.select("#image svg");


			var rSize = Number(response[0].faceLandmarks.eyeRightOuter.x - response[0].faceLandmarks.eyeRightBottom.x)/4;
			if (rSize <= 3) rSize = 3;

			for (var j = 0; j < points.length; j++) {

				d3.select("#" + points[j]).transition().duration(500)
					.attr("r", rSize)
					.style("fill", "rgba(255,255,255,0.8)")
					.attr("cx", function (d) {
						return response[0].faceLandmarks[this.id].x
					})
					.attr("cy", function (d) {
						return response[0].faceLandmarks[this.id].y
					});
			}

			d3.select("#facerect").transition().duration(500)
				.attr("x", response[0].faceRectangle.left)
				.attr("y", response[0].faceRectangle.top)
				.attr("width", response[0].faceRectangle.width)
				.attr("height", response[0].faceRectangle.height)
				.attr('fill', "none")
				.style("stroke-width", rSize)
				.attr('stroke', '#fff');

		}


		if (response.length >= 2) {

			for (var i = 1; i < response.length; i++) {

				var rSize = Number(response[i].faceLandmarks.eyeRightOuter.x - response[i].faceLandmarks.eyeRightBottom.x)/4;
				if (rSize <= 3) rSize = 3;

				var pupilLeft = svg.append("circle")
					.attr("cx", response[i].faceLandmarks.pupilLeft.x)
					.attr("cy", response[i].faceLandmarks.pupilLeft.y)
					.attr("r", rSize)
					.attr("class", "pupilLeft")
					.style("fill", "rgba(255,255,255,0.4)");

				var pupilRight = svg.append("circle")
					.attr("cx", response[i].faceLandmarks.pupilRight.x)
					.attr("cy", response[i].faceLandmarks.pupilRight.y)
					.attr("r", rSize)
					.attr("class", "pupilRight")
					.style("fill", "rgba(255,255,255,0.4)");

				var mouthLeft = svg.append("circle")
					.attr("cx", response[i].faceLandmarks.mouthLeft.x)
					.attr("cy", response[i].faceLandmarks.mouthLeft.y)
					.attr("r", rSize)
					.attr("class", "mouthLeft")
					.style("fill", "rgba(255,255,255,0.4)");

				var mouthRight = svg.append("circle")
					.attr("cx", response[i].faceLandmarks.mouthRight.x)
					.attr("cy", response[i].faceLandmarks.mouthRight.y)
					.attr("r", rSize)
					.attr("class", "mouthRight")
					.style("fill", "rgba(255,255,255,0.4)");

				var noseTip = svg.append("circle")
					.attr("cx", response[i].faceLandmarks.noseTip.x)
					.attr("cy", response[i].faceLandmarks.noseTip.y)
					.attr("r", rSize)
					.attr("class", "noseTip")
					.style("fill", "rgba(255,255,255,0.4)");

				var underLipTop = svg.append("circle")
					.attr("cx", response[i].faceLandmarks.underLipTop.x)
					.attr("cy", response[i].faceLandmarks.underLipTop.y)
					.attr("r", rSize)
					.attr("class", "underLipTop")
					.style("fill", "rgba(255,255,255,0.7)");

				var square = svg.append("rect")
					.attr("x", response[i].faceRectangle.left)
					.attr("y", response[i].faceRectangle.top)
					.attr("width", response[i].faceRectangle.width)
					.attr("height", response[i].faceRectangle.height)
					.attr('fill', "none")
					.style("stroke-width", rSize)
					.attr('stroke', '#fff');

			}
			for (var i = 0; i < response.length; i++) {
				var person = "(" + Number(i+1) + ") ";
				var gendertext =  response[i].faceAttributes.gender + ", ";
				var agetext = "age: " + Math.round(response[i].faceAttributes.age) + "; ";

				var text = svg.append("text")
					.attr("x", response[i].faceRectangle.left)
					.attr("y", response[i].faceRectangle.top + response[i].faceRectangle.height  + 25)
					.style("fill", "white")
					.style("font-size", "20px")
					.attr("dy", ".35em")
					.attr("text-anchor", "left")
					.text(person + gendertext + agetext);
			}
		}

	}
	function showHeader(response) {
		if (response.length === 0) {
			document.querySelector("#welcome").innerHTML = "No one here?";
		}
		if (response.length === 1) {
			emoji = maxEmoji(response)[0]

			if (emoji === "anger") {
				// emoji = "angry"
				emoji = "boos"
			}
			if (emoji === "neutral") {
				emoji = "neutraal"
			}
			if (emoji === "contempt") {
				emoji = "minachtig"
			}
			if (emoji === "disgust") {
				emoji = "geërgerd"
			}

			if (emoji === "fear") {
				emoji = "angtig"
			}

			if (emoji === "happiness") {
				// emoji = "happy"
				emoji = "blij"
			}

			if (emoji === "sadness") {
				emoji = "verdrietig"
			}

			if (emoji === "surprise") {
				emoji = "verrast"
			}
			document.querySelector("#welcome").innerHTML = "Je bent " + Math.round(response[0].faceAttributes.age) + " jaar en " + emoji;

			// document.querySelector("#welcome").innerHTML = "Your are " + Math.round(response[0].faceAttributes.age) + " and " + emoji;
		}
		if (response.length >= 2) {
			emoji = mode(maxEmoji(response))
			if (emoji === "anger") {
				// emoji = "angry"
				emoji = "boos"
			}
			if (emoji === "neutral") {
				emoji = "neutraal"
			}
			if (emoji === "contempt") {
				emoji = "minachtig"
			}
			if (emoji === "disgust") {
				emoji = "geërgerd"
			}

			if (emoji === "fear") {
				emoji = "angtig"
			}

			if (emoji === "happiness") {
				// emoji = "happy"
				emoji = "blij"
			}

			if (emoji === "sadness") {
				emoji = "verdrietig"
			}

			if (emoji === "surprise") {
				emoji = "verrast"
			}

			document.querySelector("#welcome").innerHTML = "Jullie zijn " +  emoji;
		}

	}

	function showText(response) {
		document.querySelector("#emotion").innerHTML = "<h3>Emotion</h3><ul></ul>"
		if (response !== undefined) {
			var maxEmojiList = maxEmoji(response);

			for (var i = 0; i < response.length; i++) {
				document.querySelector("#emotion ul").innerHTML += "<li style='list-style-type:none;'><h3 id='person_"+ response[i].faceId + "'> Persoon (" + Number(i+1) + ") </h3></li>"

				document.querySelector("#emotion ul").innerHTML += "<li> leeftijd: " +response[i].faceAttributes.age + "</li>"

				if (response[i].faceAttributes.gender === "male") {
					document.querySelector("#emotion ul").innerHTML += "<li> geslacht: man</li>"
				}
				if (response[i].faceAttributes.gender === "female") {
					document.querySelector("#emotion ul").innerHTML += "<li> geslacht: vrouw</li>"
				}

				document.querySelector("#emotion ul").innerHTML += "<li> bril: " +response[i].faceAttributes.glasses + "</li>"

				document.querySelector("#emotion ul").innerHTML += "<li> emotie: " + maxEmojiList[i] +"</li>";

				var emotionContent = "<li> emotie scores:" + "<br />";

				if (response[i].faceAttributes.emotion.anger >= 0.25) {
					emotionContent += " boosheid: " + response[i].faceAttributes.emotion.anger;
				}
				if (response[i].faceAttributes.emotion.contempt >= 0.25) {
					emotionContent += " minachting: "  + response[i].faceAttributes.emotion.contempt;
				}
				if (response[i].faceAttributes.emotion.disgust >= 0.25) {
					emotionContent += " ergernis: " +  response[i].faceAttributes.emotion.disgust;
				}
				if (response[i].faceAttributes.emotion.fear >= 0.25) {
					emotionContent += " angst: "  + response[i].faceAttributes.emotion.fear;
				}
				if (response[i].faceAttributes.emotion.happiness >= 0.25) {
					emotionContent += " blijheid: " +  response[i].faceAttributes.emotion.happiness;
				}

				emotionContent += " neutraal: " +  response[i].faceAttributes.emotion.neutral;

				if (response[i].faceAttributes.emotion.sadness >= 0.25) {
					emotionContent += " verdrietigheid: "  + response[i].faceAttributes.emotion.sadness;
				}
				if (response[i].faceAttributes.emotion.surprise >= 0.25) {
					emotionContent += " verrast: "  + response[i].faceAttributes.emotion.surprise;
				}
				emotionContent += "</li>";

				document.querySelector("#emotion ul").innerHTML += emotionContent;

				document.querySelector("#emotion ul").innerHTML += "<li> makeup: oog makeup: " + response[i].faceAttributes.makeup.eyeMakeup + " lip makeup: " + response[i].faceAttributes.makeup.lipMakeup + "</li>"

				if (response[i].faceAttributes.accessories !== undefined) {
					document.querySelector("#emotion ul").innerHTML += "<li> accessories: " +JSON.stringify(response[i].faceAttributes.accessories) + "</li>"
				}
				if (response[i].faceAttributes.exposure !== undefined) {
					document.querySelector("#emotion ul").innerHTML += "<li> exposure: " +  response[i].faceAttributes.exposure.exposureLevel + ' ' +  response[i].faceAttributes.exposure.value +"</li>";
				}
				if (response[i].faceAttributes.occlusion !== undefined) {
					document.querySelector("#emotion ul").innerHTML += "<li> foreheadOccluded: " +  response[i].faceAttributes.occlusion.foreheadOccluded + " eyeOccluded: " + response[i].faceAttributes.occlusion.eyeOccluded + " mouthOccluded: " + response[i].faceAttributes.occlusion.mouthOccluded +"</li>";
				}
				document.querySelector("#emotion ul").innerHTML += "<li> snor: " +  response[i].faceAttributes.facialHair.moustache +   " baard: " +  response[i].faceAttributes.facialHair.beard +   " bakkebaarden: " +  response[i].faceAttributes.facialHair.sideburns + "</li>";

			}
		}
	}

	function mode(arr){
	    return arr.sort((a,b) =>
	          arr.filter(v => v===a).length
	        - arr.filter(v => v===b).length
	    ).pop();
	}

	function maxEmoji(response) {
		var values = [];
		for (var i = 0; i < response.length; i++) {
			var emotionType = [];
			var emotionScore = [];

			emotionType.push("anger");
			emotionScore.push(response[i].faceAttributes.emotion.anger);
			emotionType.push("contempt");
			emotionScore.push(response[i].faceAttributes.emotion.contempt);
			emotionType.push("disgust");
			emotionScore.push(response[i].faceAttributes.emotion.disgust);
			emotionType.push("fear");
			emotionScore.push(response[i].faceAttributes.emotion.fear);
			emotionType.push("happiness");
			emotionScore.push(response[i].faceAttributes.emotion.happiness);
			emotionType.push("neutral");
			emotionScore.push(response[i].faceAttributes.emotion.neutral);
			emotionType.push("sadness");
			emotionScore.push(response[i].faceAttributes.emotion.sadness);
			emotionType.push("surprise");
			emotionScore.push(response[i].faceAttributes.emotion.surprise);

			// console.log(emotionType);
			// console.log(emotionScore);

			function findIndexOfGreatest(array) {
				var greatest;
				var indexOfGreatest;
				for (var i = 0; i < array.length; i++) {
					if (!greatest || array[i] > greatest) {
					greatest = array[i];
					indexOfGreatest = i;
					}
				}
				return indexOfGreatest;
			}

			var index = findIndexOfGreatest(emotionScore);
			values.push(emotionType[index])
		}
		return values;
	}



});

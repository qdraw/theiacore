
Dropzone.autoDiscover = false;

document.addEventListener("DOMContentLoaded", function(event){

	// Loading alternative config.json file if this one is not there. This is workaround for azure
    // getConfig("config.json");

    var isBackendServerReady = true;

    startuploading();
    uploadWidget();
    startuploading();



	var dimensions = [];

	function getConfig(url) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function () {
			if (xhr.status === 200 || xhr.status === 304) {
				data = JSON.parse(xhr.responseText);

				if (data.server !== undefined && data.inittoken !== undefined) {
					getBackendServer(data.server + "init" ,data.inittoken);
					computersaysno();
					document.querySelector("#upload-widget").action = data.server + "upload";
				}

			}
			if (xhr.status === 404) {
				console.log("error");
			}
		};
		xhr.send(null);
	}

	// for english translation
	labelMap = [];
	getLabelMap("js/id_index.json")
	function getLabelMap(url) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function () {
			if (xhr.status === 200 || xhr.status === 304) {
				labelMap = JSON.parse(xhr.responseText);
			}
			if (xhr.status === 404) {
				console.log("error");
			}
		};
		xhr.send(null);
	}




	function computersaysno() {
		document.querySelector("#welcome").innerHTML = "The computer says wait";
		document.querySelector("#info").innerHTML = "Please wait a few seconds, I'm now booting my Raspberry Pi. When this is done you can test your emotion and check how old you are. ";
		loaderHelper(1234,"img/loader1.gif");
		loaderHelper(2000,"img/loader2.gif");
		loaderHelper(6000,"img/loader3.gif");
		loaderHelper(10000,"img/loader4.gif");
		loaderHelper(12000,"img/loader5.gif");
		reloadPage(16000);
	}

	function reloadPage(time) {
		setTimeout(function(){
			if (!isBackendServerReady) {
				location.reload();
			}
		}, time);
	}

	function loaderHelper(time,url) {
		setTimeout(function(){
			if (!isBackendServerReady) {
				document.querySelector("#loader").style.display = "block";
				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.onload = function () {
					document.querySelector("#loader").style.backgroundImage =  "url('" + url +"')"
				}
				xhr.send(null);
			}

		}, time);
	}

	function startuploading() {
		if (document.querySelectorAll("#upload-widget").length >= 1) {
			document.querySelector("#upload-widget").style.display = "block";
		}
		document.querySelector("#loader").style.display = "none";
		document.querySelector("#welcome").innerHTML = "<a href='"+location+"' class='reload'></a>Show your objects here ";
		document.querySelector("#info").innerHTML = "Using this tool we can check if there are objects on this picture. By using this tool you agree the terms and conditions. We don't save the images";

	}

	function uploadWidget() {

		var uploader = new Dropzone('#upload-widget', {
			paramName: 'file',
			maxFilesize: 6, // MB
			maxFiles: 1,
			thumbnailWidth: 1000,
			thumbnailHeight: null,
			dictDefaultMessage: 'Click or drag an image to start',
			headers: {
				'x-csrf-token': document.querySelectorAll('meta[name=csrf-token]')[0].getAttribute('content'),
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

			document.querySelector("#welcome").innerHTML = "<a href='"+location+"' class='reload'></a>We are sending it to us";
			document.querySelector("#info").innerHTML = "";

			// start upload
		});

		uploader.on("sending", function(file, xhr, formData) {
			// console.log("sending");
			document.querySelector("#welcome").innerHTML = "<a href='"+location+"' class='reload'></a>Scramble the data";
			moveUploader();
			initD3();
		});

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

			console.log(resp);

			isSendingReady = true
			document.querySelector(".dz-success-mark").style.display = "none";
			showHeader(resp)
			rotateImage(document.querySelector("#image > img:nth-child(2)").src, resp.orientation, function (base64) {
				document.querySelector("#image > img:nth-child(2)").src = base64;
				showData(resp)
			});

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


	var isSendingReady = false;

	function moveUploader() {
		document.querySelector("#upload-widget").style.display = "none";
		var img = document.createElement('img')
		img.src = document.querySelector(".dz-image > img:nth-child(1)").src
		document.querySelector('#image').appendChild(img);
		document.querySelector("#image").style.display = "block";
	}

	function initD3() {

		document.querySelector('#image img').addEventListener('load', function() {
			if (!isSendingReady) {
				dimensions = {
					"width": this.naturalWidth,
					"height": this.naturalHeight
				}
				startAnimation(dimensions);
				alignPortretLandsape(dimensions.width,dimensions.height);
                console.log(dimensions);

			}
		})

		function startAnimation(dimensions) {
			// console.log("viewBox");
			var svg = d3.select("#image svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", "0 0 " + dimensions.width + " " + dimensions.height);

			var square = svg.append("rect")
				.transition()
				.attr("id", "loadrect")
				.attr("x", (Math.random() * dimensions.width) )
				.attr("y", (Math.random() * dimensions.width))
				.attr("width", (Math.random() * dimensions.width))
				.attr("height", (Math.random() * dimensions.width) )
				.attr('fill', "none")
				.style("stroke-width", ((Math.random() * 30) + 2) )
				.attr('stroke', '#fff')
				.each("end", function (d) {
					moveRectThoughScreen(this.id)
				});
				// d3.v4 code:
				// .on("end", function (d) {
				// 	// moveRectThoughScreen(this.id)
				// });

			function moveRectThoughScreen(id) {
				d3.select("#" + id).transition().duration(700)
					.attr("x", (Math.random() * dimensions.width) )
					.attr("y", (Math.random() * dimensions.width))
					.attr("width", (Math.random() * dimensions.width))
					.attr("height", (Math.random() * dimensions.width) )
					.style("stroke-width", ((Math.random() * 30) + 2) )
					.each("end", function (d) {
						if (!isSendingReady) {
							moveRectThoughScreen(this.id)
						}
					});
			}//e/my
		}


	}

	function alignPortretLandsape(width,height) {
		if (width/height <= 0.999999) {
			console.log("portret");
			document.querySelector('#image').className = "portret"
		}
		if (width/height >= 1) {
			document.querySelector('#image').className = "landscape"
		}
	}

	function showData(response) {
		var svg = d3.select("#image svg").attr("viewBox", "0 0 " + response.dimensions.width + " " + response.dimensions.height);
	    svg.selectAll("#loadrect").remove();


		alignPortretLandsape(response.dimensions.width,response.dimensions.height);

		var textnodes = [];
        var rectnodes = [];

	    console.log(response);

        for (var i = 0; i < response.data.length; i++) {
            textnodes.push({
				x: response.data[i].left,
				y: response.data[i].top - 10,
				fill: "white",
				class: "textlabel",
				text: response.data[i].keyword
			})
			rectnodes.push({
				x: response.data[i].left,
				y: response.data[i].top,
				width: response.data[i].width,
				height: response.data[i].height,
				stroke: "rgba(255,255,255,0.9)",
				class: "box",
			})
        }



		//Object.keys(response).forEach(function(key) {
		//	if (response[key].type !== undefined && labelMap !== undefined) {
		//		if (response[key].type.indexOf("box") >= 0) {
		//			display_name = labelMap[response[key].class-1].display_name

		//			if (response[key].type.indexOf("facenet") >= 0) {
		//				if (response[key].facenet.keyword.length >= 3) {
		//					display_name = response[key].facenet.keyword
		//				}
		//			}

		//			textnodes.push({
		//				x: response[key].box.left,
		//				y: response[key].box.top - 10,
		//				fill: "white",
		//				class: "textlabel",
		//				text: display_name
		//			})
		//			rectnodes.push({
		//				x: response[key].box.left,
		//				y: response[key].box.top,
		//				width: response[key].box.width,
		//				height: response[key].box.height,
		//				stroke: "rgba(255,255,255,0.9)",
		//				class: "box",
		//			})
		//		}
		//	}
		//	if (response[key].type === undefined || labelMap === undefined) {
		//		if (labelMap === undefined) {
		//			console.log(">> = undefined");
		//		}
		//	}
		//});


		var rect = svg.selectAll("rect")
		    .data(rectnodes)
		    .enter().append('rect')
		    .attr('x', function (d) { return d.x })
		    .attr('y', function (d) { return d.y })
			.attr("width", function (d) { return d.width })
			.attr("height", function (d) { return d.height })
			.attr('class', function (d) { return d.class })
			.attr('fill', "none")
			.style("stroke-width", 4)
			.attr('stroke', function (d) { return d.stroke })


		var text = svg.selectAll("text")
		    .data(textnodes)
		    .enter().append('text')
		    .style('fill', function (d) { return d.fill })
		    .attr('x', function (d) { return d.x })
		    .attr('y', function (d) { return d.y })
		  	.text(function (d) { return d.text })
			.attr('class', function (d) { return d.class })

		// Object.keys(response).forEach(function(key) {
		// 	if (response[key].type !== undefined) {
		// 		if (response[key].type.indexOf("face") >= 0) {
		// 			landmarks(svg,response[key]["face"])
		// 		}
		// 	}
		// });

	    arrangeLabels(svg);

	}
	//showdata//e/

	function landmarks(svg,landmarksList) { // per face
		for (var i = 0; i < landmarksList.length; i++) {
			// console.log(landmarksList[i]);
		    var circle = svg.append("circle")
		        .transition()
		        .attr("id", "id_" + Math.random() + "_id")
		        .attr("cx", landmarksList[i][0])
		        .attr("cy", landmarksList[i][1])
		        .attr("r", "0.8")
		        .style("fill", "rgba(255,255,255,0.8)");
		}
	}

	function arrangeLabels(svg) {
		var move = 1;
		while(move > 0) {
			move = 0;
			svg.selectAll(".textlabel")
			.each(function() {
				var that = this,
				a = this.getBoundingClientRect();
				svg.selectAll(".textlabel")
				.each(function() {
					if(this != that) {
						var b = this.getBoundingClientRect();
						if((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) &&
						(Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
							// overlap, move labels
							var dx = (Math.max(0, a.right - b.left) +
							Math.min(0, a.left - b.right)) * 0.01,
							dy = (Math.max(0, a.bottom - b.top) +
							Math.min(0, a.top - b.bottom)) * 0.02

							tt = d3.transform(d3.select(this).attr("transform")),
							to = d3.transform(d3.select(that).attr("transform"));
							move += Math.abs(dx) + Math.abs(dy);

							to.translate = [ to.translate[0] + dx, to.translate[1] + dy ];
							tt.translate = [ tt.translate[0] - dx, tt.translate[1] - dy ];
							d3.select(this).attr("transform", "translate(" + tt.translate + ")");
							d3.select(that).attr("transform", "translate(" + to.translate + ")");
							a = this.getBoundingClientRect();
						}
					}
				});
			});
		}
	}


	function showHeader(response) {
		if (response.results === 0) {
			document.querySelector("#welcome").innerHTML = "Nothing here?";
		}
        if (response.results === 1) {
            document.querySelector("#welcome").innerHTML = "Hello " + response.data[0].keyword;
        }
        if (response.results >= 1) {
            var classes = [];
            for (var i = 0; i < response.data.length; i++) {
                classes.push(response.data[0].keyword);
            }
            document.querySelector("#welcome").innerHTML = "Hello " + mode(classes) + "s";
        }

		// if (response.results === 1) {
		// 	Object.keys(response).forEach(function(key) {
		// 		if (response[key].type !== undefined) {
		// 			if (response[key].type.indexOf("box") >= 0) {
		// 				document.querySelector("#welcome").innerHTML = "Hello " + labelMap[response[key].class-1].display_name
		// 			}
		// 		}
		// 	});
		// }

		// if (response.results >= 1) {
		// 	var classes = []
		// 	Object.keys(response).forEach(function(key) {
		// 		if (response[key].type !== undefined) {
		// 			if (response[key].type.indexOf("box") >= 0) {
		// 				classes.push(labelMap[response[key].class-1].display_name)
		// 			}
		// 		}
		// 	});
		// 	document.querySelector("#welcome").innerHTML = "<a href='"+location+"' class='reload'></a>Hello " + mode(classes);
		// 	if (response.results >= 2) {
		// 		document.querySelector("#welcome").innerHTML += "s"
		// 	}
		// }

	}


	function mode(arr){
	    return arr.sort((a,b) =>
	          arr.filter(v => v===a).length
	        - arr.filter(v => v===b).length
	    ).pop();
	}





});

/*
Peter Mingione 
Williams & Sonoma / West Elm Code Challenge 
App Javascript
*/

// *********************
// Initalization Object
// *********************
var initalization = {
	// json returned from the ajax call
	files: {},
	// The .json api was giving me a Cross-Origin Request error so I added the json to the project folder.
	start: function(){
		// Ajax Request Object
		request = new XMLHttpRequest(),
		// Ajax call back
		request.onreadystatechange = function() {
  			if(this.readyState === 4 && this.status === 200) { 
				files = JSON.parse(this.responseText);
				gallery.populate(files);
			} 
			else if (this.readyState !== 4 || this.status !== 200){
				document.getElementById("gallery").innerHTML = '<div class="alert alert-danger">' + this.readyState + ' ' + this.status + '</div>';
			} 
		}
		// Open an ajax request
    	//request.open('GET', 'https://www.westelm.com/services/catalog/v4/category/shop/new/all-new/index.json');
		request.open('GET', 'app.php');
		// Send the ajax request
		request.send(null);
	}
};

// ******************
// Gallery Object
// ******************
var gallery = {

	// This function creates the gallery of items
	populate: function(files){

		// Clear the gallery of all previous elements
		document.getElementById("gallery").innerHTML = "";

		// This loop adds one tile to the gallery per iteration
		for(var i = 0; i < files.groups.length; i++){

			var image = `<img src="${files.groups[i].thumbnail.href}" alt="${files.groups[i].thumbnail.href}"/>`;

			var imageWrapper  = document.createElement("DIV");
			imageWrapper.setAttribute("class", "col-xs-12 col-sm-6 col-md-4 image-wrapper");
			imageWrapper.setAttribute("onclick", `overlay.populate(${i})`);
			imageWrapper.innerHTML = image;

			var imageTitle = document.createElement("DIV");
			var imageText = document.createTextNode(files.groups[i].name.toUpperCase());
			imageTitle.appendChild(imageText);
			imageTitle.classList.add("image-title");
			imageWrapper.appendChild(imageTitle);

			var price = document.createElement("DIV");
			var priceText = document.createTextNode("$ " + files.groups[i].priceRange.selling.high);
			price.appendChild(priceText);
			price.classList.add("price");
			imageWrapper.appendChild(price);

			document.getElementById("gallery").appendChild(imageWrapper);
		}
	}
};

// ******************
// Overlay Object
// ******************
var overlay = {

	// globals that must persist for the overlay function
	currentGroup: null,
	currentImage: 0,
	savedInterval: 0,

	// This function  builds the overlay that is seen when an item in the gallery is clicked on.
	populate: function(group){

		currentGroup = group;
		currentImage = 0;

		document.getElementById("overlay-title").innerHTML = "<h3>" + files.groups[group].name + "</h3>";

		document.getElementById("overlay-bottom").classList.add("active");
		document.getElementById("overlay-top").classList.add("active");

		// Close the overlay by clicking the close box
		document.getElementById("overlay-close").onclick = function(){
			document.getElementById("overlay-bottom").classList.remove("active");
			document.getElementById("overlay-top").classList.remove("active");
			document.getElementById("image-list").innerHTML = "";
			clearInterval(overlay.savedInterval);
			currentGroup = null;
			currentImage = 0;
		}

		// Close the overlay by clicking the background
		document.getElementById("overlay-bottom").onclick = function(){
			document.getElementById("overlay-bottom").classList.remove("active");
			document.getElementById("overlay-top").classList.remove("active");
			document.getElementById("image-list").innerHTML = "";
			clearInterval(overlay.savedInterval);	
			currentGroup = null;
			currentImage = 0;
		}

		// Scroll the thumnail menu down one image
		document.getElementById("down-arrow").onmousedown = function(){
		    $("#image-list").animate({ scrollTop: "-=115px" }, 50);
		}

		// Scroll the thumnail menu up one image
		document.getElementById("up-arrow").onmousedown = function(){
		   $("#image-list").animate({ scrollTop: "+=115px" }, 50);
		}

		document.getElementById("overlay-image").innerHTML = 
		   `<img src="${files.groups[group].thumbnail.href}" alt=""/>\
			<div class="image-prev" id="image-prev" onclick="overlay.prevImage()">\
				<i class="fa fa-angle-left"></i>\
			</div>\
			<div class="image-next" id="image-next" onclick="overlay.nextImage()">\
				<i class="fa fa-angle-right"></i>\
			</div><ul class="circles" id="circles"></ul>`;

		for(var i=0; i<files.groups[group].images.length; i++){
			if(i == 0){
				document.getElementById("circles").innerHTML += 
				   `<li class="active" id="circle-item-${i}">\
						<i class="fa fa-circle"></i>\
						<i class="fa fa-circle-o" onclick="overlay.goToImage(${i});"></i>\
					</li>`;

				document.getElementById("image-list").innerHTML += 
				    `<li class="image-list-item" id="image-list-item">\
				    	<img class="active image-list-item-${i}" src="${files.groups[currentGroup].images[i].href}" alt="" onclick="overlay.goToImage(${i})"/>\
				    </li>`;
			}
			else{
				document.getElementById("circles").innerHTML += 
				   `<li class="" id="circle-item-${i}">\
						<i class="fa fa-circle"></i>\
						<i class="fa fa-circle-o" onclick="overlay.goToImage(${i})"></i>\
					</li>`;

				document.getElementById("image-list").innerHTML += 
				   `<li class="image-list-item" id="image-list-item">\
						<img class="image-list-item-${i}" src="${files.groups[currentGroup].images[i].href}" alt="${files.groups[currentGroup].images[i].href}" onclick="overlay.goToImage(${i})"/>\
					</li>`;
			}
		}

		overlay.savedInterval = setInterval(function(){ overlay.nextImage(); }, 7000);
	},

	// This function:
	// Shows the previous alt image on the overlay
	// Updates the circle icons at the bottom of the image
	// Resets the slide show
	prevImage: function(){

		document.querySelector(`#circle-item-${currentImage}`).classList.remove("active");
		document.querySelector(`.image-list-item-${currentImage}`).classList.remove("active");

		if(currentImage > 0){
			document.querySelector("#overlay-image img").src = files.groups[currentGroup].images[currentImage-1].href;
			currentImage--;
		}
		else if (currentImage == 0){
			document.querySelector("#overlay-image img").src = files.groups[currentGroup].images[files.groups[currentGroup].images.length-1].href;
			currentImage = files.groups[currentGroup].images.length-1;
		}
		else{
			document.querySelector("#overlay-image img").src = files.groups[currentGroup].images[0].href;
			currentImage = 0;
		}

		document.querySelector(`#circle-item-${currentImage}`).classList.add("active");
		document.querySelector(`.image-list-item-${currentImage}`).classList.add("active");

		clearInterval(overlay.savedInterval);
		overlay.savedInterval = setInterval(function(){ overlay.nextImage(); }, 7000);
	},

	// This function:
	// Shows the next alt image on the overlay
	// Updates the circle icons at the bottom of the image
	// Resets the slide show
	nextImage: function(){

		document.querySelector(`#circle-item-${currentImage}`).classList.remove("active");
		document.querySelector(`#image-list-item .image-list-item-${currentImage}`).classList.remove("active");

		if(currentImage >= 0 && currentImage < files.groups[currentGroup].images.length-1  ){
			document.querySelector("#overlay-image img").src = files.groups[currentGroup].images[currentImage+1].href;
			currentImage++;
		}
		else if (currentImage == files.groups[currentGroup].images.length-1){
			document.querySelector("#overlay-image img").src = files.groups[currentGroup].images[0].href;
			currentImage = 0;
		}
		else{
			document.querySelector(`#overlay-image img`).src = files.groups[currentGroup].images[0].href;
		}

		document.querySelector(`#circle-item-${currentImage}`).classList.add("active");
		document.querySelector(`#image-list-item .image-list-item-${currentImage}`).classList.add("active");

		clearInterval(overlay.savedInterval);
		overlay.savedInterval = setInterval(function(){ overlay.nextImage(); }, 7000);
	},

	// This image shows a specific image on the overlay
	goToImage: function(num){
		document.querySelector(`#circle-item-${currentImage}`).classList.remove("active");
		document.querySelector(`.image-list-item-${currentImage}`).classList.remove("active");

		document.querySelector("#overlay-image img").src = files.groups[currentGroup].images[num].href;
		currentImage = num;
		document.querySelector(`#circle-item-${num}`).classList.add("active");
		document.querySelector(`.image-list-item-${num}`).classList.add("active");

		clearInterval(overlay.savedInterval);
		overlay.savedInterval = setInterval(function(){ overlay.nextImage(); }, 7000);
	}
};

//************
// Page Init
//************
initalization.start();


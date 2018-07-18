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
	
	// Load the model data
	start: function(){
		// Ajax Request Object
		request = new XMLHttpRequest(),
		// Ajax call back
		request.onreadystatechange = function() {
  			if(this.readyState === 4 && this.status === 200) { 
				files = JSON.parse(this.responseText);
				// Add images to the image gallery
				gallery.populate(files);
				// Event Listeners:
				// Close the overlay by clicking the close box
				document.querySelector("#overlay-close").onclick = function(){
					overlay.close();
				}
				// Close the overlay by clicking the background
				document.querySelector("#overlay-bottom").onclick = function(){
					overlay.close();
				}
				// Show the previous alt image
				document.querySelector("#image-prev").onclick = function(){
					overlay.prevImage();	
				}
				// Show the next alt image
				document.querySelector("#image-next").onclick = function(){
					overlay.nextImage();
				}

			} 
			else if (this.readyState !== 4 || this.status !== 200){
				document.querySelector("#gallery").innerHTML = '<div class="alert alert-danger">state: ' + this.readyState + ' | status: ' + this.status + '</div>';
			} 
		}
		// Open an ajax request
    	// request.open('GET', 'https://www.westelm.com/services/catalog/v4/category/shop/new/all-new/index.json');
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
		document.querySelector("#gallery").innerHTML = "";

		// This loop adds one tile to the gallery per iteration.
		for(var i = 0; i < files.groups.length; i++){

			var image = `<img src="${files.groups[i].thumbnail.href}" alt=""/>`;

			var imageWrapper  = document.createElement("DIV");
			imageWrapper.setAttribute("class", "col-xs-12 col-sm-6 col-md-4 image-wrapper");

			// Add an onclick listener to each tile
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

			document.querySelector("#gallery").appendChild(imageWrapper);
		}
	}
};

// ******************
// Overlay Object
// ******************
var overlay = {

	// globals that must persist between calls to the populate method.
	currentGroup: null,
	currentImage: 0,
	savedInterval: 0,

	// This function  builds the overlay that is seen when an item in the gallery is clicked on.
	populate: function(group){

		currentGroup = group;
		currentImage = 0;

		document.querySelector("#overlay-title").innerHTML = "<h3>" + files.groups[group].name + "</h3>";

		document.querySelector("#overlay-bottom").classList.add("active");
		document.querySelector("#overlay-top").classList.add("active");

		// Add a onclick listener to the down arrow
		document.querySelector("#down-arrow").onmousedown = function(){
			overlay.scrollThumbnailsDown();	    
		}

		// Add a onclick listener to the up arrow
		document.querySelector("#up-arrow").onmousedown = function(){
			overlay.scrollThumbnailsUp();	   
		}

		// Add the main image to the overlay
		document.querySelector("#overlay-image img").src = `${files.groups[group].thumbnail.href}`;

		// This loop adds the circles to the bottom of the overlay image
		// It also adds the thumbnail images to the image gallery
		// It also adds a onclick listener to each image and to each circle
		for(var i=0; i<files.groups[group].images.length; i++){
			if(i == 0){
				document.querySelector("#circles").innerHTML += 
				   `<li class="active" id="circle-item-${i}">\
						<i class="fa fa-circle"></i>\
						<i class="fa fa-circle-o" onclick="overlay.goToImage(${i});"></i>\
					</li>`;

				document.querySelector("#image-list").innerHTML += 
				    `<li class="image-list-item" id="image-list-item">\
				    	<img class="active image-list-item-${i}" src="${files.groups[currentGroup].images[i].href}" alt="" onclick="overlay.goToImage(${i})"/>\
				    </li>`;
			}
			else{
				document.querySelector("#circles").innerHTML += 
				   `<li class="" id="circle-item-${i}">\
						<i class="fa fa-circle"></i>\
						<i class="fa fa-circle-o" onclick="overlay.goToImage(${i})"></i>\
					</li>`;

				document.querySelector("#image-list").innerHTML += 
				   `<li class="image-list-item" id="image-list-item">\
						<img class="image-list-item-${i}" src="${files.groups[currentGroup].images[i].href}" alt="" onclick="overlay.goToImage(${i})"/>\
					</li>`;
			}
		}

		overlay.savedInterval = setInterval(function(){ overlay.nextImage(); }, 7000);
	},

	// Callback:
	// Closes the overlay
	close: function(){
		document.querySelector("#overlay-bottom").classList.remove("active");
			document.querySelector("#overlay-top").classList.remove("active");
			document.querySelector("#image-list").innerHTML = "";
			document.querySelector("#circles").innerHTML = "";
			clearInterval(overlay.savedInterval);
			currentGroup = null;
			currentImage = 0;
	},

	// Callback:
	// Shows the previous alt image on the overlay
	// Updates the circle icons at the bottom of the image
	// and resets the slide show
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

	// Callback:
	// Shows the next alt image on the overlay
	// Updates the circle icons at the bottom of the image
	// and resets the slide show
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

	// Callback:
	// This function shows a specific image on the overlay
	goToImage: function(num){
		document.querySelector(`#circle-item-${currentImage}`).classList.remove("active");
		document.querySelector(`.image-list-item-${currentImage}`).classList.remove("active");

		document.querySelector("#overlay-image img").src = files.groups[currentGroup].images[num].href;
		currentImage = num;
		document.querySelector(`#circle-item-${num}`).classList.add("active");
		document.querySelector(`.image-list-item-${num}`).classList.add("active");

		clearInterval(overlay.savedInterval);
		overlay.savedInterval = setInterval(function(){ overlay.nextImage(); }, 7000);
	},

	// Callback:
	// This function scrolls the thumbnail gallery down
	scrollThumbnailsDown: function(){
		$("#image-list").animate({ scrollTop: "+=115px" }, 50);
	},

	// Callback:
	// This function scrolls the thumbnail gallery up
	scrollThumbnailsUp: function(){
		$("#image-list").animate({ scrollTop: "-=115px" }, 50);
	}
};

//************
// Page Init
//************
initalization.start();


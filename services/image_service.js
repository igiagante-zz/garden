var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	Plant = require('../models/plant.js'),
	Images = require('../models/image.js'),
	im = require('imagemagick');

var upload = function(image, mainImage, path, callback){

	fs.readFile(image.path, function (err, data) {
		if(err) {
			callback(err);
		}

		// Create the folder for a specific plant
	    if (!fs.existsSync(path)){
	    	fs.mkdirSync(path);
	        fs.mkdirSync(path + '/fullsize/');
	        fs.mkdirSync(path + '/thumbs/');
	    }

		var newPath = path + '/fullsize/' + image.originalname;

		var thumbPath = path + '/thumbs/'  + image.originalname;

		var images = [];

		fs.rename(image.path, newPath);

		/// write file to uploads/fullsize folder
		fs.writeFile(newPath, data, function (err) {

			console.log('writing file in ... ' + newPath);

			if(err) {
				logger.debug('todo mal ------ ' + err)
				return callback(err);
			}

			console.log('write file to uploads/fullsize folder')

			Img.create({ kind: "detail", url: newPath, main: mainImage}, function(err, imageDetail) {
				if(err) {
					console.log('The full image couldnt be saved');
					return callback(err);
				}
				//adding imageDetail to images array
				images.push(imageDetail.id);

				console.log(' image fullsize uploaded ' + image.originalname);

				console.log(' resizing fullsize uploaded ' + image.originalname);

				im.resize({ srcPath: newPath, dstPath: thumbPath, width: 200 }, 

					function(err, stdout, stderr){
				
					if (err) {
						console.log('The thumbnail image couldnt be saved');
						return callback(err);
					}
			  
			  		console.log('resized image to fit within 200x200px');

					Img.create({ kind: "thumbnail", url: thumbPath, main: mainImage }, function(err, imageThumb){
					
						if(err) {
							console.log('The thumb image couldnt be saved');
							return callback(err);
						}	

						//adding imageThumb.id to images array
						images.push(imageThumb.id);		

						console.log('images : ' + images);		

						return callback(undefined, images);	
					});
				});			
			});	
		});		 
	});
};

var imageFiles = function(plant_id, callback){

	var imagesData = [];

	getImagesData(plant_id , function callback(error, images) {
        
        if(error) {
            return res.send(error).status(500);
        }
        
        imagesData = imagesData.concat(images);
    });

	var files = [];

	for (var i = 0; i < imagesData.length; i++) {
		fs.readFile(imagesData[i].url, function (err, data) {
			if(err) {
				console.log('The file wasn\'t found ' + imagesData[i].url);
				throw err;
			}
		  	files.push(data);
		});
	};

	return callback(undefined, files);
};

var getImagesData = function(plant_id, callback){

	var images = [];

	Plant.findById(plant_id, function(err, plant) {

        if(err) {
			console.log('The plant wasn\'t found');
			return callback(err);
		}

		var imageIds = plant.images;

        imageIds.forEach(function(imageId){
        		
        	Images.findById(imageId, function(err, image) {
        		if(err) {
					console.log('The image wasn\'t found');
					return callback(err);
				}
				
				images.push(image);

				//check if all the images were added.
		    	if(images.length === imageIds.length){
		    		return callback(undefined, images);
		    	}
        	});
        });    
    });
};

var mainImage = function(plant_id, callback){

	var images = [];

	var mainImage = {};

	Plant.findById(plant_id, function(err, plant) {

        if(err) {
			console.log('The plant wasn\'t found');
			return callback(err);
		}

        plant.images.forEach(function(imageId){

        	// _id -> without _ it does not work !!!
        	Images.findOne({ _id : imageId, 'kind' : 'thumbnail' }, function(err, image) {

        		if(err) {
					console.log('The image wasn\'t found');
				}

				if(image !== null){

					mainImage.id = image.id;
					mainImage.kind = image.kind;
					mainImage.url = image.url;
					mainImage.main = image.main;

					return callback(undefined, mainImage);
				}
        	});
        });	 	   
    });    
};


module.exports = {
	getImagesData : getImagesData,
	mainImage : mainImage,
	imageFiles : imageFiles,
	upload : upload
}
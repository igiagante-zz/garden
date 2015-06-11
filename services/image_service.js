var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	Plant = require('../models/plant.js'),
	Images = require('../models/image.js'),
	im = require('imagemagick');

var upload = function(image, mainImage, folder, callback){

	var fileName = image.originalname;

	//path to write files
    var newPath = dirPath + '/fullsize/' + fileName;
    var thumbPath = dirPath + '/thumbs/' + fileName;

	var directories = [mainPath, fullsizeImagePath, thumbImagePath];

	var createImageDirectory = function(folder, createImageDirectoryCallback){

		var mainPath = process.cwd() + '/public' + '/images/uploads/' + folder;
		var fullsizeImagePath = dirPath + '/fullsize/';
		var thumbImagePath = dirPath + '/thumbs/';

		var iterator = function(d, cb){
		  fs.mkdir(d, cb);
		}

		async.each(directories, iterator, function(err){
		  if (err) return createImageDirectoryCallback(err);
		  logger.log('all dirs created, moving on');
		  createImageDirectoryCallback();
		});
	};

	var readImageFile = function(image, readImageFileCallback){

		fs.readFile(image.path, function (err, data) {
			fs.rename(image.path, newPath);
			readImageFileCallback();
		}
	};

	var writeImageFile = function(writeImageCallback){
		
		fs.writeFile(newPath, data, function (err) {

			console.log('writing file in ... ' + newPath);

			if(err) {
				logger.debug('todo mal ------ ' + err)
				return writeImageCallback(err);
			}
			writeImageCallback();
		}
	};

	var resizeImage = function(resizeImageCallback){

		im.resize({ srcPath: newPath, dstPath: thumbPath, width: 200 }, 

			function(err, stdout, stderr){
		
			if (err) {
				console.log('The thumbnail image couldnt be saved');
				return resizeImageCallback(err);
			}
	  
	  		console.log('resized image to fit within 200x200px');

			return resizeImageCallback(undefined, imageDetail.id);	
		});	
	};

	var createImage = function(createImageCallback){

		//paths to urls
		var urlPath = '/images/uploads/' + folder + '/fullsize/' + fileName;
		var thumbnailUrlPath = '/images/uploads/' + folder + '/thumbs/'  + fileName;

		Img.create({url: urlPath, thumbnailUrl: thumbnailUrlPath, main: mainImage, name: fileName}, function(err, imageDetail) {
			if(err) {
				console.log('The full image couldnt be saved');
				return createImageCallback(err);
			}

			console.log(' image fullsize uploaded ' + image.originalname);

			console.log(' resizing fullsize uploaded ' + image.originalname);		

			createImageCallback();	
		});
	};


	//Image Creation Process 
	async.waterfall([

		//Create directory to persist user plants' images
	    async.apply(createImageDirectory(createImageDirectoryCallback)),

		//Read image file
	    async.apply(readImageFile(readImageFileCallback)),

	    //Resize image in order to create a thumbnail
	    async.apply(resizeImage(resizeImageCallback)),

	    //Write image file in disk
	    async.apply(writeImageFile(writeImageCallback)),

	    //Save image data in database
	    async.apply(createImage(createImageCallback))

	});

	fs.readFile(image.path, function (err, data) {
		if(err) {
			callback(err);
		}

		// Create the folder for a specific plant
	    if (!fs.existsSync(dirPath)){
	    	fs.mkdirSync(dirPath);
	        fs.mkdirSync(dirPath + '/fullsize/');
	        fs.mkdirSync(dirPath + '/thumbs/');
	    }

	    //path to write files
	    var newPath = dirPath + '/fullsize/' + fileName;
	    var thumbPath = dirPath + '/thumbs/' + fileName;

	    //paths to urls
		var urlPath = '/images/uploads/' + folder + '/fullsize/' + fileName;
		var thumbnailUrlPath = '/images/uploads/' + folder + '/thumbs/'  + fileName;

		fs.rename(image.path, newPath);

		/// write file to uploads/fullsize folder
		fs.writeFile(newPath, data, function (err) {

			console.log('writing file in ... ' + newPath);

			if(err) {
				logger.debug('todo mal ------ ' + err)
				return callback(err);
			}

			console.log('write file to uploads/fullsize folder')


				
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
    });
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

				image.url = 'http://localhost:3000' + image.url;
				image.thumbnailUrl = 'http://localhost:3000' + image.thumbnailUrl;
				
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
var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	Plant = require('../models/plant.js'),
	Images = require('../models/image.js'),
	async = require('async'),
	im = require('imagemagick');

var upload = function(image, mainImage, folder, populateDataCallback){

	var fileName = image.originalname;
	var mainPath = process.cwd() + '/public' + '/images/uploads/' + folder;

	//path to write files
    var newPath = mainPath + '/fullsize/' + fileName;
    var thumbPath = mainPath + '/thumbs/' + fileName;  

	var createImageDirectory = function(folder, createImageDirectory){
	
		var fullsizeImagePath = mainPath + '/fullsize/';
		var thumbImagePath = mainPath + '/thumbs/';

		var directories = [mainPath, fullsizeImagePath, thumbImagePath];

		var iterator = function(d, cb){
		  fs.mkdir(d, cb);
		}

		async.each(directories, iterator, function(err){
		  if (err) return createImageDirectoryCallback(err);
		  logger.debug('all dirs created, moving on');  
		});

		createImageDirectory(null, 'directories created');
	};

	var readImageFile = function(image, readImageFileCallback){

		fs.readFile(image.path, function (err, data) {
			fs.rename(image.path, newPath);
			readImageFileCallback(null, data);
		});
	};

	var writeImageFile = function(data, writeImageCallback){
		
		fs.writeFile(newPath, data, function (err) {

			if(err) {
				logger.error('todo mal ------ ' + err)
				return writeImageCallback(err);
			}
			writeImageCallback(null, 'file created');
		});
	};

	var resizeImage = function(resizeImageCallback){

		im.resize({ srcPath: newPath, dstPath: thumbPath, width: 200 }, 

			function(err, stdout, stderr){
		
			if (err) {
				logger.error('The thumbnail image couldnt be saved');
				return resizeImageCallback(err);
			}
			resizeImageCallback(null, 'success');	
		});	
	};

	var createImage = function(createImageCallback){

		//paths to urls
		var urlPath = '/images/uploads/' + folder + '/fullsize/' + fileName;
		var thumbnailUrlPath = '/images/uploads/' + folder + '/thumbs/'  + fileName;

		Img.create({url: urlPath, thumbnailUrl: thumbnailUrlPath, main: mainImage, name: fileName}, 
			function(err, imageDetail) {
				if(err) {
					console.log('The full image couldnt be saved');
					return createImageCallback(err);
				}

				createImageCallback(null, imageDetail.id);	
			});
	};

	async.auto({

	    get_data: function(callback){
	        logger.debug('Reading image file');	
	        readImageFile(image, callback);
	    },

	    make_folder: function(callback){
	        console.debug('Creating directories');
	        createImageDirectory(folder, callback);
	    },

	    write_file: ['get_data', 'make_folder', function(callback, results){
	    	console.debug('Writing image file');
	        writeImageFile(results.get_data, callback);
	    }],

	    resize_image: ['get_data', 'make_folder', function(callback, results){
	    	console.debug('Resize image to create a thumbnail');
	        resizeImage(callback);
	    }],

	    create_image: ['write_file', function(callback, results){
	    	console.debug('Save image data in database');
	        createImage(callback);
	    }]
	    
	}, function(err, results) {
	    logger.error('err = ', err);
	    populateDataCallback(undefined, results.create_image);
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
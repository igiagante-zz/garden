var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	Plant = require('../models/plant.js'),
	Images = require('../models/image.js'),
	async = require('async'),
	im = require('imagemagick');

var upload = function(image, folder, plantId, mainCallback){

	var fileName = image.originalname;
	var mainPath = process.cwd() + '/public' + '/images/uploads/' + folder;

	//path to write files
    var newPath = mainPath + '/fullsize/' + fileName;
    var thumbPath = mainPath + '/thumbs/' + fileName;  

    var mainImage = image.mainImage;

    var checkDirectoriesExist = function(existDirectoriesCallback){

    	var fullsizeImagePath = mainPath + '/fullsize/';
		var thumbImagePath = mainPath + '/thumbs/';

		var directories = [mainPath, fullsizeImagePath, thumbImagePath];

		var created = false;

		var iterator = function(dir, callback){
			fs.exists(dir, function(exist){
				if(exist) {
					created = true;
				}
				callback(null);
			});
		};

		async.each(directories, iterator, function(err){
		  if (err) return existDirectoriesCallback(err);
		  existDirectoriesCallback(null, directories, created);
		});
	};

	var createImageDirectory = function(directories, created, createImageDirectoryCallback){

		var iterator = function(d, cb){
			fs.mkdir(d, cb);
		}

		if(created) {
			console.log('directories are already created');
			createImageDirectoryCallback(null);
		}else{
			async.each(directories, iterator, function(err){
			  if (err) return createImageDirectoryCallback(err);
			  console.log('directories created'); 
			  createImageDirectoryCallback(null);
			});
		}
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
			writeImageCallback(null);
		});
	};

	var resizeImage = function(resizeImageCallback){

		im.resize({ srcPath: newPath, dstPath: thumbPath, width: 200 }, 

			function(err, stdout, stderr){
		
			if (err) {
				logger.error('The thumbnail image couldnt be saved');
				return resizeImageCallback(err);
			}
			resizeImageCallback(null);	
		});	
	};

	var createImage = function(createImageCallback){

		//paths to urls
		var urlPath = '/images/uploads/' + folder + '/fullsize/' + fileName;
		var thumbnailUrlPath = '/images/uploads/' + folder + '/thumbs/'  + fileName;

		Img.create({url: urlPath, thumbnailUrl: thumbnailUrlPath, main: mainImage, name: fileName, plantId: plantId}, 
			function(err, image) {
				if(err) {
					console.log('The full image couldnt be saved');
					return createImageCallback(err);
				}
				createImageCallback(null, image);	
			});
	};

	async.waterfall([
	    function(callback) {
	        logger.debug('Check if directories were created before');
	        checkDirectoriesExist(callback);
	    },
	    function(directories, created, callback) {
	      	logger.debug('Creating directories');
	        createImageDirectory(directories, created, callback);
	    },
	    function(callback) {
	        logger.debug('Reading image file');	
	        readImageFile(image, callback);
	    },
	    function(data, callback) {
	        logger.debug('Writing image file');
	        writeImageFile(data, callback);
	    },
	    function(callback) {
	        logger.debug('Resize image to create a thumbnail');
	        resizeImage(callback);
	    },
	    function(callback) {
	        logger.debug('Save image data in database');
	        createImage(callback);
	    },
	    function(image, callback) {
	        logger.debug('Save image data in database');
	        mainCallback(undefined, image);
	    }
	], function (err, result) {
	    logger.debug('result = ', result);
	    logger.error('err = ', err);
	});
};

//put all main image attributes in 0
var clearMainImageAttribute = function(plantId, resetMainImageCallback){

	Images.find({ plantId: plantId }, function(err, image){
		if(err) {
			console.log('The image wasn\'t found');
			return resetMainImageCallback(err);
		}

		if(image !== null){
			mainImage.main = 0;
		}

		// save the plant
        image.save(function(err) {
            if (err) return resetMainImageCallback(err);
            return resetMainImageCallback(null);
        });
	});
};

//put main image attribute in 1 for a specific plant
var setMainImage = function(image, setMainImagecallback){

	var plantId = image.plantId;
	var imageId = image.imageId;
	var main = image.main;
	
	Images.findOne({ _id : imageId, plantId : plantId }, function(err, image) {

		if(err) {
			console.log('The image wasn\'t found');
			return callback(err);
		}

		if(image !== null){
			mainImage.main = main;
		}
		// save the plant
        image.save(function(err) {
            if (err) return setMainImagecallback(err);
            return setMainImagecallback(undefined, image);
        });
	});
};

//put attribute mainImage in 0 or 1
var resetMainImage = function(plantId, mainImageData){

	async.auto({

		getPlantIdFn: function(callback){
	        logger.debug('Get Plant Data');	
	        
	        Plant.findById(plantId, function(err, plant) {

		        if(err) {
					console.log('The plant wasn\'t found');
					return callback(err);
				}
				callback(null, plant.id);
			});
	    },

	    clearMainImageAttributeFn: ['getPlantDataFn', function(callback, results){
	        logger.debug('Clear main image attribute in all images from one plant');	
	        clearMainImageAttribute(results.getPlantIdFn, callback);
	    }],

	    setMainImageFn: ['getPlantDataFn', function(callback, results){
	        logger.debug('Set main image attribute in one plant');	
	        setMainImage(mainImageData, callback);
	    }]
	    
	}, function(err, results) {
	    logger.error('err = ', err);
	});	
};

var getMainImage = function(plantId, callback){

	Images.findOne({ plantId : plantId, 'main' : 1 }, function(err, image) {

		if(err) {
			console.log('The image wasn\'t found');
			return callback(err);
		}

		if(image !== null){
			return callback(undefined, image);
		}
	});
};

var getImagesFilesData = function(plant_id, callback){

	var files = [];

	Images.find({ plantId : plantId }, function(err, images) {

		if(err) {
			console.log('The image wasn\'t found');
			return callback(err);
		}

		files = files.concat(images);
	});

	for (var i = 0; i < files.length; i++) {
		if(files[i] !== undefined){
			files[i].url = 'http://localhost:3000' + image.url;
			files[i].thumbnailUrl = 'http://localhost:3000' + image.thumbnailUrl;
		}
	}

	return callback(undefined, files);
};

module.exports = {
	getMainImage : getMainImage,
	getImagesFilesData : getImagesFilesData,
	upload : upload,
	resetMainImage : resetMainImage
}
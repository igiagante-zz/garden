var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	Plant = require('../models/plant.js'),
	Images = require('../models/image.js'),
	async = require('async'),
	im = require('imagemagick');

/* --------------------------------- Add images ------------------------------ */

var addImage = function(image, addImageCallback){

	var folder = image.originalname.split('.')[0];
	var plantId = image.plantId;

	var fileName = image.originalname;
	var mainPath = process.cwd() + '/public' + '/images/uploads/' + folder;

	//path to write files
    var newPath = mainPath + '/fullsize/' + fileName;
    var thumbPath = mainPath + '/thumbs/' + fileName;  

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

		Img.create({url: urlPath, thumbnailUrl: thumbnailUrlPath, main: image.main, name: fileName, plantId: plantId}, 
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
	        addImageCallback(undefined, image);
	    }
	], function (err, result) {
	    logger.debug('result = ', result);
	    logger.error('err = ', err);
	});
};


var addImages = function(images, addImagesCallback){

	async.each(images, addImage, function(err){
   		return addImagesCallback(err)
	});
	/*
	var imagesAdded = [];

	for (var i = 0; i < images.length; i++) {	

		addImage(images[i], function(image, addImagesCallback){
			imagesAdded.push(image);

			if(imagesAdded.length == images.length){
				addImagesCallback(null, images);
			}
		});
	};*/
};

/* --------------------------------- Add images ------------------------------ */


/* --------------------------------- Update images ------------------------------ */

var updateImage = function(image, callback){
	
	Images.findOne({ _id : image.imageId, plantId : image.plantId }, function(err, imageDetail) {
		if(err) {
			console.log('The image wasn\'t found');
			return callback(err);
		}
		if(imageDetail !== null){
			imageDetail.main = image.main;
		}
		// save the image
        image.save(function(err) {
            if (err) return callback(err);
            return callback();
        });
	});
};

var updateImages = function(images, updateImagesCallback){

	async.each(images, updateImage, function(err){

		if(err) {
			return updateImagesCallback(err);
		}
   		return addImagesCallback();
	});
/*
	var imagesUpdated = [];

	for (var i = 0; i < images.length; i++) {
		updateImage(files[i], function(image, updateImagesCallback){
			
			imagesUpdated.push(image);

			if(imagesUpdated.length == images.length){
				updateImagesCallback(null, images);
			}
		});
	};
	*/
};

/* --------------------------------- Update images ------------------------------ */

/* --------------------------------- Delete images ------------------------------ */

var deleteImage = function(image, deleteImageCallback) {
	Images.find({ _id: image.id }).remove(deleteImageCallback()).exec();
};

var deleteImages = function(images, deleteImagesCallback) {

	async.each(images, deleteImage, function(err){
   		return deleteImagesCallback(err);
	});

/*
	var count = 0;

	for (var i = 0; i < images.length; i++) {
		
		deleteImage(files[i], function(deleteImagesCallback){

			count++;

			if(count == images.length){
				deleteImagesCallback(null, images);
			}
		});
	};
	*/
};

/* --------------------------------- Delete images ------------------------------ */

/* ----- Functions used by filters function ------ */

var imageExists = function(image, callback){
    Image.findOne( _id : image.id, function(error, image){
        if (err) {                
            return res.send(err).status(500);
        }
        if(image !== undefined) {
            callback(undefined, true);
        }else{
            callback(undefined, false);
        }
    });
};

var imageToBeDelete = function(image, callback){
	if(image.delete === 'delete'){
        callback(undefined, true);
    }else{
        callback(undefined, false);
    }
};

var contains = function (haystack, needle) {
    return !!~haystack.indexOf(needle);
};

/* ----- Functions used by filters function ------ */

/* ----- Apply filters in oder to discriminate actions over the images ------ */

var filterImages = function(images, filterImagesCallback){

	var arrays = [];

	//filter images to be updated
	var imagesToBeUpdated = [];

	async.filter(images, imageExists, function(results){
    	imagesToBeUpdate = imagesToBeUpdate.concat(results);
	});

	arrays.push(imagesToBeUpdated);

	//filter images to be added
	var imagesToBeAdded = [];

	//closure to check if an image should be added
	var isImageAdded = function(image, callback){
	    if(image !== undefined && contains(images, image)) {
	        callback(undefined, true);
	    }else{
	        callback(undefined, false);
	    }   
	};

	arrays.push(imagesToBeAdded);

	async.filter(images, isImageAdded, function(results){
    	imagesToBeAdded = imagesToBeAdded.concat(results);
	});

	//filter images to be deleted
	var imagesToBeDeleted = [];

	async.filter(images, imageToBeDelete, function(results){
    	imagesToBeDelete = imagesToBeDelete.concat(results);
	});

	arrays.push(imagesToBeDeleted);

	//return three arrays, each one with their corresponding image
	console.log('arrays : ' arrays);

	filterImagesCallback(undefined, arrays);
};
/* ----- Apply filters in oder to discriminate actions over the images ------ */

var imagesProcess = function(images, imageProcessCallback){

	logger.log(' -------------------------------------------------------------------------- ');
	logger.log(' -------------------------- Start Images Process -------------------------- ');
	logger.log(' -------------------------------------------------------------------------- ');

	var imagesToBeUpdated = []; 
	var imagesToBeAdded = [];
	var imagesToBeDeleted = [];

	var filterImagesCallback = function(arrays){
		imagesToBeUpdated = arrays[0]; 
		imagesToBeAdded = arrays[1]; 
		imagesToBeDeleted = arrays[2]; 
	};

	//Filter images in different groups
	logger.log(' -------------------   Filter images in different groups   ---------------------- ');
	filterImages(images, filterImagesCallback);

	async.parallel({
	    addImagesFn: function(callback){	
	    	logger.debug('Add new images');
	    	addImages(imagesToBeAdded, callback);     
	    },
	    updateImagesFn: function(callback){
	    	logger.debug('Update images');
	        updateImages(imagesToBeUpdated, callback);
	    },
	    deleteImagesFn: function(callback){
	    	logger.debug('Delete images');
	    	deleteImages(imagesToBeDeleted, callback);
	    }
	},
	function(err, results) {
	    // results is now equals to: {addImagesFn: [], updateImagesFn: []}
	    /*
	    var newImageList = [];
	    newImageList = newImageList.concat(addImages);
	    newImageList = newImageList.concat(updateImages);
	    imageProcessCallback(undefined, newImageList); */
	    logger.debug('Return the new images array');
	    Images.find(function(err, images){
	    	return imageProcessCallback(undefined, images);
	    });
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

var getImagesFilesData = function(plantId, callback){

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
	imagesProcess : imagesProcess
}
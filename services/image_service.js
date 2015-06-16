var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	Plant = require('../models/plant.js'),
	Images = require('../models/image.js'),
	async = require('async'),
	im = require('imagemagick');

/* --------------------------------- Add images ------------------------------ */

var addImage = function(image){

	var mainPath;
    var newPath;
    var folder;

    var getPlantInfo = function(plantId, getPlantInfoCallback){
		Plant.findById(plantId, function(error, plant){
			if(error) {
				console.log('The image wasn\'t found');
				return readImageFileDataCallback(error);
			}
			folder = plant.name;
			mainPath = process.cwd() + '/public' + '/images/uploads/' + folder;
			newPath = mainPath + '/fullsize/' + image.originalname;
			getPlantInfoCallback(null);
		});
	};

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

	var renameImageFilePath = function(image, readImageFileCallback){

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

		var thumbPath = mainPath + '/thumbs/' + image.originalname;  

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

		var fileName = image.originalname;
		var fileType = image.mimetype;
		var fileSize = image.size;

		//paths to urls
		var urlPath = '/images/uploads/' + folder + '/fullsize/' + fileName;
		var thumbnailUrlPath = '/images/uploads/' + folder + '/thumbs/'  + fileName;
		var deleteUrlPath = '/images/uploads/' + folder;

		Img.create({ 
			url: urlPath, 
			thumbnailUrl: thumbnailUrlPath, 
			delete_url: deleteUrlPath,
			name: fileName,
			type: fileType,
			size: fileSize,
			main: image.main, 			 
			plantId: plantId }, 
			function(err, image) {
				if(err) {
					console.log('The full image couldnt be saved');
					return createImageCallback(err);
				}
				createImageCallback(null, image);	
			});
	}

	async.waterfall([
		function(callback) {
	        logger.debug('Get info from the plant');
	        getPlantInfo(callback);
	    },
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
	        renameImageFilePath(image, callback);
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
	    }
	], function (err, result) {
	    logger.debug('result = ', result);
	    logger.error('err = ', err);
	});
};


var addImages = function(images, addImagesCallback){

	async.each(images, addImage, function(err){
		if(err) {
			return addImagesCallback(err);
		}
   		return addImagesCallback(null);
	});
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
};

/* --------------------------------- Update images ------------------------------ */

/* --------------------------------- Delete images ------------------------------ */

var removeFile = function(path, removeFileCallback) {

	fs.exists(path, function(exists){
		if(exists){
			fs.unlink(path, function (error) {
				if(error) {
				    logger.error('The image couldn\'t be deleted');
				    logger.error(error);
				    return removeFileCallback(error);
				}
				logger.info('Image successfully deleted');
				removeFileCallback(null);
			});
		}else{
			removeFileCallback(null);
		}		
	});
};

var deleteDirectories = function(folderName, deleteDirectoriesCallback){

	var path = process.cwd() + '/public' + '/images/uploads/' + folderName;
	var fullsizePath = path + '/fullsize/';
	var thumbsPath = path + '/thumbs/';

	logger.debug('Delete directories');

	var ifExistDirDelete = function(path, cb){
		fs.exists(path, function(exists){
			if(exists){
				fs.rmdir(path, cb);
			}else{
				cb();
			}
		});
	};

	var directories = [path, fullsizePath, thumbsPath];

	async.each(directories, ifExistDirDelete, function(err){
		if (err) return deleteDirectoriesCallback(err);
		deleteDirectoriesCallback(null);
	});
}

var deleteImage = function(imageId, deleteImageCallback) {
	Images.find({ _id: imageId }).remove(function(error){
        if(error) {
            logger.error('The image couldn\'t be saved');
            logger.error(error);
            return deleteImageCallback(error);
        }
        var message = 'Image successfully deleted from Database';
        logger.debug(message);
        deleteImageCallback(null, message);
    }).exec();
};

var deleteProcess = function(image, deleteProcessCallback){

	var folderName = image.name.split('.')[0];
	var path = process.cwd() + '/public' + '/images/uploads/' + folderName;
	var fullsizePath = path + '/fullsize/' + image.name;
	var thumbsPath = path + '/thumbs/' + image.name;

	async.series([ 
		function(deleteProcessCallback){
			logger.debug('Remove thumbnail file');
			removeFile(thumbsPath, deleteProcessCallback);
		},
		function(callback){
			logger.debug('Remove fullsize file');
			removeFile(fullsizePath, callback);
		},
		function(callback){
			logger.debug('Remove fullsize file');
			deleteDirectories(folderName, callback);
		},
		function(callback){
			logger.debug('Remove image data from database');
			deleteImage(image.id, callback);
		}
	]);
};

var readImageFileData = function(imageId, readImageFileDataCallback){

	Images.findOne({_id : imageId}, function(err, image) {
		if(err) {
			console.log('The image wasn\'t found');
			return readImageFileDataCallback(err);
		}	

		if(image === undefined || image === null){
			return readImageFileDataCallback('The image does not exist');
		}
		console.log('image : ' + image);
		readImageFileDataCallback(null, image);
	});
};

var deleteImageProcess = function(imageId, mainCallback){
 	
 	async.waterfall([
	    function(callback) {
	        logger.log('Reading image data from database');
	        readImageFileData(imageId, callback);
	    },
	    function(image, callback) {
	      	logger.debug('After found the image, lets execute image delete process');
	        deleteProcess(image, callback);
	    },
	    function(message, callback) {
	        logger.debug('Lets see if the image was successfully deleted');	
	        mainCallback(message);
	    }
	], function (err, result) {
	    logger.debug('result = ', result);
	    logger.error('err = ', err);
	    if(err){
	    	mainCallback(err);
	    }
	});
};

/* --------------------------------- Delete images ------------------------------ */

/* ----- Functions used by filters function ------ */

var imageExists = function(image, callback){
    Image.findOne( {_id : image.id }, function(error, image){
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

	//return three arrays, each one with their corresponding image
	console.log('arrays : ' + arrays);

	filterImagesCallback(undefined, arrays);
};
/* ----- Apply filters in oder to discriminate actions over the images ------ */


var imagesProcess = function(images, imageProcessCallback){

	logger.log(' -------------------------------------------------------------------------- ');
	logger.log(' -------------------------- Start Images Process -------------------------- ');
	logger.log(' -------------------------------------------------------------------------- ');

	var imagesToBeUpdated = []; 
	var imagesToBeAdded = [];

	var filterImagesCallback = function(arrays){
		imagesToBeUpdated = arrays[0]; 
		imagesToBeAdded = arrays[1];  
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

var getImagesFilesData = function(plant_id, callback){

	Images.find({ plantId : plant_id }, function(err, images) {

		if(err) {
			console.log('The image wasn\'t found');
			return callback(err);
		}
		return callback(undefined, images);
	});
};

module.exports = {
	getMainImage : getMainImage,
	getImagesFilesData : getImagesFilesData,
	deleteImageProcess : deleteImageProcess,
	imagesProcess : imagesProcess
}
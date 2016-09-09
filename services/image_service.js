var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	Plant = require('../models/plant.js'),
	Images = require('../models/image.js'),
	async = require('async'),
	im = require('imagemagick'),
	plantService = require('./plant_service.js');

/* --------------------------------- Add images ------------------------------ */

var createImageResource = function(image){

	imageResource = {};

	imageResource.url = image.url;
	imageResource.thumbnailUrl = image.thumbnailUrl;
	imageResource.name = image.name;
	imageResource.type = image.type;
	imageResource.size = image.size;
	imageResource.deleteUrl = image.deleteUrl;
	imageResource.main = image.main;
	imageResource.links = [
		{
			"plant" : "/api/plants/" + image.plantId
		}
	];
	return imageResource;
};

var addImage = function(plantId, image, mainCallback){

	var mainPath;
    var newPath;
    var folder;

	var checkImageExist = function(checkImageExistCallback) {
        
        var fileName = image.originalname;
   
        Images.findOne({name : fileName}, function(err, image) {
			if(err) {
				return checkImageExistCallback(err);
			}	

			if(image != null){
				logger.debug('fileName : ' + fileName);
				logger.debug('image : ' + image);
				return checkImageExistCallback('The image already exists. Try with other file, please!');
			}else{
				checkImageExistCallback(null);
			}
		});
    };

    var getPlantInfo = function(plantId, getPlantInfoCallback){

	plantService.getPlantName(plantId, function(error, plantName){
			if(error){
	            return getPlantInfoCallback(error);
			}
			folder = plantName;
			mainPath = process.cwd() + '/public' + '/images/uploads/' + folder;
			newPath = mainPath + '/fullsize/' + image.originalname;
			getPlantInfoCallback(null);
		});
	};

    var checkDirectoriesExist = function(existDirectoriesCallback){

    	var fullsizeImagePath = mainPath + '/fullsize/';
		var thumbImagePath = mainPath + '/thumbs/';

		//It's important the order of the directories
		var directories = [mainPath, fullsizeImagePath, thumbImagePath];

		var created = false;

		var iterator = function(dir, callback){
			fs.exists(dir, function(exist){
				if(exist) {
					created = true;
				}else{
					created = false;					
				}
				callback(null);
			});
		};

		//The next iterator is only called once the current one has completed
		async.eachSeries(directories, iterator, function(err){
		  if (err) return existDirectoriesCallback(err);
		  existDirectoriesCallback(null, directories, created);
		});
	};

	var createImageDirectory = function(directories, created, createImageDirectoryCallback){

		var iterator = function(d, cb){
			fs.mkdir(d, cb);
		}

		if(created) {
			logger.debug('directories are already created');
			createImageDirectoryCallback(null);
		}else{
			//The next iterator is only called once the current one has completed
			async.eachSeries(directories, iterator, function(err){
			  if (err) return createImageDirectoryCallback(err);
			  logger.debug('directories created'); 
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
				logger.error(' The data could not be persisted ' + err);
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

		console.log('image : ' + JSON.stringify(image));

		var fileName = image.originalname;
		var fileType = image.mimetype;
		var fileSize = image.size;
		var mainImage = image.main;

		//paths to urls
		var urlPath = '/images/uploads/' + folder + '/fullsize/' + fileName;
		var thumbnailUrlPath = '/images/uploads/' + folder + '/thumbs/'  + fileName;
		var deleteUrlPath = '/api/image/id';

		console.log(' MAIN : ' + mainImage);

		Img.create({ 
			url: urlPath, 
			thumbnailUrl: thumbnailUrlPath, 
			deleteUrl: deleteUrlPath,
			name: fileName,
			type: fileType,
			size: fileSize,
			main: mainImage, 			 
			plantId: plantId }, 
			function(err, image) {
				if(err) {
					logger.error('The full image couldnt be saved');
					return createImageCallback(err);
				}
				createImageCallback(null, image);	
			});
	}

	var updateDeleteUrl = function(imageId, updateDeleteUrlCallback){

		Images.findById(imageId, function(error, image){

			if(error) {
				logger.error('The image was not found');
				return updateDeleteUrlCallback(error);
			}

			image.deleteUrl = '/api/images/' + imageId;

			image.save(function(error) {
	            if(error) {
					logger.error('The image was not updated');
					return updateDeleteUrlCallback(error);
				}
	            updateDeleteUrlCallback(null, image);
	        });
		});
	};

	async.waterfall([		
		function(callback) {
	        logger.debug('Check if image already exists');
	        checkImageExist(callback);
	    },
		function(callback) {
	        logger.debug('Get info from the plant');
	        getPlantInfo(plantId, callback);
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
	    },
	    function(image, callback) {
	        logger.debug('Update delete url');
	        updateDeleteUrl(image.id, callback);
	    },
	    function(image, callback) {
	        mainCallback(null, image);
	    }
	], function (err, result) {
	    logger.error('err = ', err);
	    if(err){
	    	return mainCallback(err);
	    }   
	});
};

/* --------------------------------- Add images ------------------------------ */


/* --------------------------------- Update images ------------------------------ */

var updateImage = function(image, callback){
	
	Images.findOne({ _id : image.imageId, plantId : image.plantId }, function(err, imageDetail) {
		if(err) {
			logger.debug('The image wasn\'t found');
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
				logger.debug('Image successfully deleted');
				removeFileCallback(null);
			});
		}else{
			logger.debug('file does not exist : ' + path);
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
				fs.rmdir(path, function(err){
					if(err){
						logger.debug('Fail delete directory');
						logger.debug(err);
					}
					cb(null);
				});
			}else{
				cb(null);
			}
		});
	};

	//the order of the directories are important!
	var directories = [fullsizePath, thumbsPath, path];

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
        logger.debug('Image was successfully deleted from Database');
        deleteImageCallback(null);
    }).exec();
};

var deleteProcess = function(image, deleteProcessCallback){

	var folder;
	var path;
	var plantId = image.plantId;
	
	var getPlantInfo = function(plantId, getPlantInfoCallback){

		plantService.getPlantName(plantId, function(error, plantName){
			if(error){
	            return getPlantInfoCallback(error);
			}
			folder = plantName;
			path = process.cwd() + '/public' + '/images/uploads/' + folder;
			getPlantInfoCallback(null);
		});
	};

	async.series([
		function(callback) {
	        logger.debug('Get info from the plant');
	        getPlantInfo(plantId, callback);
	    },
		function(callback){
			logger.debug('Remove thumbnail file');
			var thumbsPath = path + '/thumbs/' + image.name;
			removeFile(thumbsPath, callback);
		},
		function(callback){
			logger.debug('Remove fullsize file');
			var fullsizePath = path + '/fullsize/' + image.name;
			removeFile(fullsizePath, callback);
		},
		function(callback){
			logger.debug('Remove directories in case they don\'t contain more images');
			deleteDirectories(folder, callback);
		},
		function(callback){
			logger.debug('Remove image data from database');
			deleteImage(image.id, callback);
		},
	    function(callback) {
	        deleteProcessCallback(null, image);
	    }
	]);
};

var readImageData = function(imageId, readImageDataCallback){

	Images.findOne({_id : imageId}, function(err, image) {
		if(err) {
			logger.debug('The image wasn\'t found');
			return readImageDataCallback(err);
		}	

		if(image === undefined || image === null){
			return readImageDataCallback('The image does not exist');
		}
		readImageDataCallback(null, image);
	});
};

var deleteImageProcess = function(imageId, mainCallback){
 	
 	async.waterfall([
	    function(callback) {
	        logger.debug('Reading image data from database');
	        readImageData(imageId, callback);
	    },
	    function(image, callback) {
	      	logger.debug('After found the image, lets execute image delete process');
	        deleteProcess(image, callback);
	    },
	    function(image, callback) {
	        logger.debug('The image was successfully deleted');	
	        mainCallback(image);
	    }
	], function (err, result) {
	    logger.error('err = ', err);
	    if(err){
	    	mainCallback(err);
	    }
	});
};

/* --------------------------------- Delete images ------------------------------ */

var getMainImage = function(plantId, callback){

	Images.findOne({ plantId : plantId, 'main' : 1 }, function(err, image) {

		if(err) {
			logger.debug('The image wasn\'t found');
			return callback(err);
		}

		if(image !== null){
			return callback(undefined, image);
		}
	});
};

var getImagesFilesData = function(plant_id, callback){

	var imagesResources = [];

	Images.find({ plantId : plant_id }, function(err, images) {

		if(err) {
			logger.debug('The image wasn\'t found');
			return callback(err);
		}

		for (var i = 0; i < images.length; i++) {
			imagesResources.push(createImageResource(images[i]));
			if(images.length === imagesResources.length)
				return callback(undefined, imagesResources);
		};
	});
};

module.exports = {
	getMainImage : getMainImage,
	getImagesFilesData : getImagesFilesData,
	deleteImageProcess : deleteImageProcess,
	addImage : addImage
}
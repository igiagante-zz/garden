/**
 * @author Ignacio Giagante, on 22/3/16.
 */

"use strict";

var fs = require('extfs'),
    logger = require('../utils/logger'),
    async = require('async'),
    im = require('imagemagick'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    mkdir = require('mkdir-p'),
    rimraf = require('rimraf');


var pathImagesUploaded = process.cwd() + '/public/images/uploads/';

var getFolderImagePath = function (folderName) {
    return pathImagesUploaded + folderName;
};

var getMainImagePath = function (folderName, imageFileName) {
    return pathImagesUploaded + folderName + '/fullsize/' + imageFileName;
};

var getThumbImagePath = function (folderName, imageFileName) {
    return pathImagesUploaded + folderName + '/thumb/' + imageFileName;
};

var getUrlImagePath = function (folderName, imageFileName) {
    return '/images/uploads/' + folderName + '/fullsize/' + imageFileName;
};

var getThumbUrlImagePath = function (folderName, imageFileName) {
    return '/images/uploads/' + folderName + '/thumb/' + imageFileName;
};


/** ------------------------------ Create Model Flow ------------------------------------------ **/

/**
 * Resize image size.
 * @param folderName - the folder name
 * @param imageFileName - the original file name
 * @param resizeImageCallback - Callback to communicate if the exit was successful
 */
var resizeImage = function (folderName, imageFileName, resizeImageCallback) {

    var mainPath = getMainImagePath(folderName, imageFileName);
    var thumbPath = getThumbImagePath(folderName, imageFileName);

    im.resize({srcPath: mainPath, dstPath: thumbPath, width: 400},

        function (err) {
            if (err) {
                logger.error('The thumbnail image could not be saved \n');
                logger.error(err);
                return resizeImageCallback(err);
            }
            resizeImageCallback(undefined);
        });
};

/**
 * Rename the image path file.
 * @param image
 * @param newPath
 * @param renameImageFilePathCallback
 */
var renameImageFilePath = function (image, newPath, renameImageFilePathCallback) {

    fs.readFile(image.path, function (err, data) {
        if (err) {
            return renameImageFilePathCallback(err);
        }
        fs.rename(image.path, newPath);
        renameImageFilePathCallback(undefined, data);
    });
};

/**
 * Write the Image data into a file.
 * @param data Data to be written
 * @param newPath
 * @param writeImageCallback
 */
var writeImageFile = function (data, newPath, writeImageCallback) {

    fs.writeFile(newPath, data, function (err) {
        if (err) {
            logger.debug(' The data could not be persisted ' + err);
            return writeImageCallback(err);
        }
        logger.debug(' File created: ' + newPath);
        writeImageCallback(undefined);
    });
};


/**
 * Persist image file.
 * @param folderName
 * @param image Image File
 * @param mainCallback
 */
var persistImageFile = function (folderName, image, mainCallback) {

    var newPath = pathImagesUploaded + folderName + '/fullsize/' + image.originalname;

    async.waterfall([

        function (callback) {
            logger.debug('Reading image file: ' + newPath);
            renameImageFilePath(image, newPath, callback);
        },
        function (data, callback) {
            logger.debug('Writing image file: ' + newPath);
            writeImageFile(data, newPath, callback);
        },
        function (callback) {
            logger.debug('Resize image to create a thumbnail: ' + image.originalname);
            resizeImage(folderName, image.originalname, callback);
        },
        function (callback) {
            callback(null, image);
        }
    ], function (err, result) {
        if (err) {
            return mainCallback(err);
        }
        mainCallback(undefined, result);
    });
};

/**
 * Persist each image in the folder's entity
 * @param folderName
 * @param files
 * @param persistImageFilesCallback
 */
var persistImageFiles = function (folderName, files, persistImageFilesCallback) {

    if (_.isEmpty(files)) {
        return persistImageFilesCallback(undefined);
    }

    var images = [];

    _.forEach(files, function (value, key) {
        console.log(key);
        images.push(value);
    });

    async.each(images, function (file, callback) {
        // Perform operation on file here.

        console.log('Processing file ----> ' + file.name);

        persistImageFile(folderName, file, callback);

    }, function (err) {
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A file failed to process');
            return persistImageFilesCallback(err);
        }
        console.log('All files have been processed successfully');
        persistImageFilesCallback(undefined);
    });
};

/**
 * Create images' directories if they were not created.
 * @param folderName - Folder's name
 * @param createImageDirectoryCallback
 */
var createImageDirectory = function (folderName, files, createImageDirectoryCallback) {

    if (_.isEmpty(files)) {
        return createImageDirectoryCallback(undefined);
    }

    var fullsizeImagePath = getMainImagePath(folderName, "");
    var thumbImagePath = getThumbImagePath(folderName, "");

    var flow = {

        createFullsizeImageFolder: function (callback) {
            fs.exists(fullsizeImagePath, function (exist) {
                if (!exist) {
                    mkdir(fullsizeImagePath, function (err) {
                        if (err) {
                            return createImageDirectoryCallback(err + fullsizeImagePath + ' could not be created');
                        }
                        logger.debug('directory created : ' + fullsizeImagePath);
                    });
                }
                callback(undefined, fullsizeImagePath);
            });
        },

        createThumbImageFolder: ['createFullsizeImageFolder', function (callback) {
            fs.exists(thumbImagePath, function (exist) {
                if (!exist) {
                    mkdir(thumbImagePath, function (err) {
                        if (err) {
                            return createImageDirectoryCallback(err + thumbImagePath + ' could not be created');
                        }
                        logger.debug('directory created : ' + thumbImagePath);
                    });
                }
                callback(undefined, thumbImagePath);
            });
        }]
    };

    async.auto(flow, function (error, results) {
        if (error) {
            return createImageDirectoryCallback(error);
        }
        logger.debug('directories created: ' + results.createFullsizeImageFolder + ' ' + results.createThumbImageFolder);
        createImageDirectoryCallback(undefined);
    });
};

/**
 * Process Image files in order to persist each one of them
 * @param folderName Folder's name
 * @param files Image file
 * @param createProcessImageFilesCallback
 */
var createProcessImageFiles = function (folderName, files, createProcessImageFilesCallback) {

    var flow = {
        // Persist each new image file
        createImageDirectory: async.apply(createImageDirectory, folderName, files),

        // Update images data from the model
        persistImageFiles: ['createImageDirectory', async.apply(persistImageFiles, folderName, files)]
    };

    async.auto(flow, function (error, results) {
        if (error) {
            return createProcessImageFilesCallback(error);
        }
        createProcessImageFilesCallback(undefined, results);
    });
};

/** ------------------------------ Create Model Flow Finished ------------------------------------------ **/

/**
 * Delete a folder with all the images files
 * @param folderName
 * @param deleteFolderImageCallback
 */
var deleteFolderImage = function (folderName, deleteFolderImageCallback) {
    rimraf(getFolderImagePath(folderName), function (error) {
        if (error) {
            deleteFolderImageCallback(error);
        }
    });
    deleteFolderImageCallback(undefined);
};

/** ----------------------------------- Delete Model Flow ----------------------------------------------- **/

/**
 * Delete a file.
 * @param path the path file
 * @param removeFileCallback
 */
var removeFile = function (path, removeFileCallback) {

    fs.exists(path, function (exists) {
        if (exists) {
            fs.unlink(path, function (error) {
                if (error) {
                    logger.debug('The image couldn\'t be deleted');
                    logger.debug(error);
                    return removeFileCallback(error);
                }
                logger.debug('Image successfully deleted: ' + path);
                removeFileCallback(undefined);
            });
        } else {
            logger.debug('file does not exist : ' + path);
            removeFileCallback(undefined);
        }
    });
};

/**
 * Delete images directory.
 * @param folderName
 * @param deleteDirectoriesCallback
 */
var deleteImageDirectories = function (folderName, deleteDirectoriesCallback) {

    logger.debug('Check if directories should be deleted');

    var imageFolderPath = getFolderImagePath(folderName);
    var fullsizeImagePath = getMainImagePath(folderName, "");
    var thumbImagePath = getThumbImagePath(folderName, "");

    var flow = {
        deleteFullsizeImageFolder: function (callback) {
            fs.exists(fullsizeImagePath, function (exist) {
                if (exist) {
                    fs.rmdir(fullsizeImagePath, function (err) {
                        if (err) {
                            logger.debug('The directory couldn\'t be deleted');
                        }
                        callback(undefined, fullsizeImagePath);
                    });
                }
                callback(undefined);
            });
        },
        deleteThumbImageFolder: ['deleteFullsizeImageFolder', function (callback) {
            fs.exists(thumbImagePath, function (exist) {
                if (exist) {
                    fs.rmdir(thumbImagePath, function (err) {
                        if (err) {
                            logger.debug('The directory couldn\'t be deleted');
                        }
                        callback(undefined, thumbImagePath);
                    });
                }
                callback(undefined);
            });
        }],

        deleteImageFolder: ['deleteFullsizeImageFolder', 'deleteThumbImageFolder', function (callback) {
            fs.exists(imageFolderPath, function (exist) {
                if (exist) {
                    fs.rmdir(imageFolderPath, function (err) {
                        if (err) {
                            logger.debug('The directory couldn\'t be deleted');
                        }
                        callback(undefined, imageFolderPath);
                    });
                }
                callback(undefined);
            });
        }]
    };

    async.auto(flow, function (err, results) {
        if (err) {
            return deleteDirectoriesCallback(err);
        }
        if (results.createFullsizeImageFolder) {
            logger.debug('full size directory directory deleted: ' + results.createFullsizeImageFolder);
        }
        if (results.createThumbImageFolder) {
            logger.debug('thumbnail directory deleted: ' + results.createThumbImageFolder);
        }
        if (results.deleteImageFolder) {
            logger.debug('main directory deleted: ' + results.deleteImageFolder);
        }
        deleteDirectoriesCallback(undefined);
    });
};

/**
 * Delete image file.
 * @param folderName the folder name
 * @param imageName the image name
 * @param deleteImageFileCallback
 */
var deleteImageFile = function (folderName, imageName, deleteImageFileCallback) {

    async.series([
            function (callback) {
                logger.debug('Remove thumbnail file');
                var thumbsPath = getThumbImagePath(folderName, imageName);
                removeFile(thumbsPath, callback);
            },
            function (callback) {
                logger.debug('Remove full size file');
                var fullsizePath = getMainImagePath(folderName, imageName);
                removeFile(fullsizePath, callback);
            },
            function (callback) {
                logger.debug('Remove directories in case they don\'t contain more images');
                deleteImageDirectories(folderName, callback);
            }
        ],
        function (err) {
            if (err) {
                return deleteImageFileCallback(err);
            }
            return deleteImageFileCallback(undefined);
        });
};

/**
 * Delete one or more image (file) in the folder's entity
 * @param folderName
 * @param files
 * @param deleteImageFilesCallback
 */
var deleteImageFiles = function (folderName, files, deleteImageFilesCallback) {

    if (_.isEmpty(files)) {
        return deleteImageFilesCallback(undefined);
    }

    async.each(files, function (file, callback) {

        // Perform operation on file here.
        logger.info('Processing file ----> ' + file.name);

        deleteImageFile(folderName, file.name, callback);
    }, function (err) {
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A file failed to process');
            return deleteImageFilesCallback(err);
        }
        logger.info('All files have been processed successfully');

        deleteImageFilesCallback(undefined);
    });
};

/**
 * Delete file images for one model.
 * @param folderName the name of the folder
 * @param callback callback for the async auto
 * @param results results.getImagesDataToBeDelete represents resources ids images to be deleted
 */
var deleteImageFilesProcess = function (folderName, callback, results) {
    //delete images for one model
    deleteImageFiles(folderName, results.getImagesDataToBeDelete, function (err, result) {
        if (err) {
            logger.debug(' the image ' + result + ' could not be deleted ' + err);
            return callback(err);
        }
        //logger.debug(' the image ' + result + ' was deleted successfully. ');
        callback(undefined, result);
    });
};

/** ------------------------------ Delete Model Flow Finished ------------------------------------------ **/

/**
 * Verify if one or more images should be deleted from database.
 * @param imagesFromDB Represent an array of image documents
 * @param resourcesIds Represent an array of resources ids
 * @param callback
 * @returns {Array} Represent documents that should be deleted
 */
var verifyIfImagesShouldBeDeleted = function (imagesFromDB, resourcesIds, callback) {

    logger.debug(' Getting image to be deleted ');

    if (resourcesIds) {
        //Represent an array of resources ids which are found in imagesFromDB Array
        var result = imagesFromDB.filter(function (item) {
            return resourcesIds.filter(function (id) {
                    return item._id == id;
                }).length === 0;
        });

        logger.debug('The following images should be deleted. ');
        logger.debug(JSON.stringify(result));

        callback(undefined, result);
    } else {
        callback(undefined);
    }
};

/**
 * Convert files data into image documents
 * @param folderName the folder name
 * @param files
 * @param imageMain Main Image's Name
 * @param callback
 * @returns {Array} Represent image documents
 */
var getImageData = function (folderName, files, imageMain, callback) {

    if (_.isEmpty(files)) {
        return callback(undefined);
    }

    var imageData = [];

    // Object.keys
    var keys = Object.keys(files);

    for (var i = 0; i < keys.length; ++i) {

        var file = files[keys[i]];

        //paths to urls
        var urlPath = getUrlImagePath(folderName, file.originalname);
        var thumbnailUrlPath = getThumbUrlImagePath(folderName, file.originalname);

        var data = {};
        data._id = mongoose.Types.ObjectId();
        data.url = urlPath;
        data.name = file.originalname;

        var fileName = _.split(file.originalname, '.', 2);

        data.thumbnailUrl = thumbnailUrlPath;
        data.type = file.mimetype;
        data.size = file.size;
        data.main = imageMain === fileName[0];

        imageData.push(data);
    }

    callback(undefined, imageData);
};

/** ------------------------------ Update Model Flow ------------------------------------------ **/

/**
 * Update model with image documents
 * @param model Model to be updated
 * @param callback
 * @param results
 */
var updateModel = function (model, callback, results) {

    logger.debug(' Update model with image\'s documents ');

    var imagesDataToBeDeleted = results.getImagesDataToBeDelete;
    var imagesDoc = results.getImagesDataFromRequest;

    //Add new images
    if (imagesDoc) {
        for (var i = 0; i < imagesDoc.length; i++) {
            model.images.push(imagesDoc[i]);
        }
    }

    //Delete some images
    if (imagesDataToBeDeleted) {
        for (var k = 0; k < imagesDataToBeDeleted.length; k++) {
            for (var j = 0; j < model.images.length; j++) {
                if (model.images[j]._id == imagesDataToBeDeleted[k]._id) {
                    model.images[j].remove();
                }
            }
        }
    }

    callback(undefined, model);
};

var updateImageFolderName = function (oldName, newName, callback) {
    if (!_.isEmpty(oldName)) {

        var oldPath = pathImagesUploaded + oldName;
        var newPath = pathImagesUploaded + newName;

        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                return callback(err);
            }
        });
    }
    callback(undefined);
};

var getImagesDataFromRequest = function (model, request, callback) {

    logger.debug(' Getting image data from files ');

    getImageData(model.name, request.files, request.body.mainImage, function (err, data) {
        if (err) {
            return callback(err);
        }
        callback(undefined, data);
    });
};

/**
 * Each entity which contains images, can use this process to update its images.
 * @param request
 * @param model The model that should be updated
 * @param oldFolderName If the value is not empty, the folder's image name should be updated
 * @param mainCallback
 */
var processImageUpdate = function (request, model, oldFolderName, mainCallback) {

    //convert model to json and then to Array
    var imagesFromDB = JSON.parse(JSON.stringify(model.images));

    //obtain resourcesIds in order to check if some picture needs to be updated
    var resourcesIds = null;
    if (request.body.resourcesIds) {
        resourcesIds = JSON.parse(request.body.resourcesIds);
    }

    var folderName = model.name;

    var flow = {

        //If the name of the plant (Model) changes, the folder's image path should be updated.
        updateImageFolderName: async.apply(updateImageFolderName, oldFolderName, request.body.name),

        // Get images data from request in order to update images data from Model
        getImagesDataFromRequest: ['updateImageFolderName', async.apply(getImagesDataFromRequest, model, request)],

        // Persist each new image file
        persistImagesFiles: ['getImagesDataFromRequest', async.apply(persistImageFiles, folderName, request.files)],

        // Check resources ids in order to decide if one of them should be deleted
        getImagesDataToBeDelete: async.apply(verifyIfImagesShouldBeDeleted, imagesFromDB, resourcesIds),

        // Delete files whose resource id doesn't exist any more. The data of resources ids comes
        // from results.getImagesDataToBeDelete and injected in deleteImageFilesProcess function
        deleteImagesFiles: ['getImagesDataToBeDelete', async.apply(deleteImageFilesProcess, folderName)],

        // Update images data from the model
        updateImagesDataFromModel: ['persistImagesFiles', 'deleteImagesFiles', 'getImagesDataToBeDelete', async.apply(updateModel, model)],

        // Save the model once it has been updated

        save: ['updateImagesDataFromModel', function (callback, results) {

            //obtain the model updated
            var model = results.updateImagesDataFromModel;

            model.save(function (err) {
                if (err) {
                    return callback(err);
                }

                logger.debug(' The model was updated successfully! ');
                callback(undefined, model);
            });
        }]
    };

    async.auto(flow, function (error, results) {
        if (error) {
            return mainCallback(error);
        }
        mainCallback(undefined, results);
    });
};
/** ------------------------------ Update Flow Finish ------------------------------------------ **/

module.exports = {
    getImageData: getImageData,
    resizeImage: resizeImage,
    createImageDirectory: createImageDirectory,
    renameImageFilePath: renameImageFilePath,
    writeImageFile: writeImageFile,
    removeFile: removeFile,
    deleteImageDirectories: deleteImageDirectories,
    persistImageFile: persistImageFile,
    deleteImageFile: deleteImageFile,
    verifyIfImagesShouldBeDeleted: verifyIfImagesShouldBeDeleted,
    processImageUpdate: processImageUpdate,
    persistImageFiles: persistImageFiles,
    createProcessImageFiles: createProcessImageFiles,
    deleteFolderImage: deleteFolderImage
};


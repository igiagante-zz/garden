/**
 * Created by igiagante on 22/3/16.
 */

"use strict";

var fs = require('extfs'),
    logger = require('../utils/logger'),
    async = require('async'),
    im = require('imagemagick'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    path = require('path'),
    mkdir = require('mkdir-p');

var parentDir = path.resolve(process.cwd(), '..');
var pathImagesUploaded = parentDir + '/public/images/uploads/';

var getFolderImagePath = function (folderName) {
    return pathImagesUploaded + folderName;
};

var getMainImagePath = function (folderName, imageFileName) {
    return getFolderImagePath() + '/fullsize/' + imageFileName;
};

var getThumbImagePath = function (folderName, imageFileName) {
    return getFolderImagePath() + '/thumb/' + imageFileName;
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

    im.resize({srcPath: mainPath, dstPath: thumbPath, width: 200},

        function (err) {
            if (err) {
                logger.error('The thumbnail image could not be saved');
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
 * @param newPath
 * @param writeImageCallback
 */
var writeImageFile = function (data, newPath, writeImageCallback) {

    fs.writeFile(newPath, data, function (err) {
        if (err) {
            logger.error(' The data could not be persisted ' + err);
            return writeImageCallback(err);
        }
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

    var newPath = getMainImagePath(folderName, image.originalname);

    async.waterfall([

        function (callback) {
            logger.debug('Reading image file');
            renameImageFilePath(image, newPath, callback);
        },
        function (data, callback) {
            logger.debug('Writing image file');
            writeImageFile(data, newPath, callback);
        },
        function (callback) {
            logger.debug('Resize image to create a thumbnail');
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

    logger.debug( ' Persisting image files ');

    //parallel implementation
    /*
     async.forEach(files, function (file, innerCallback) {

     // Perform operation on file here.
     logger.debug('Processing file ' + file);

     persistImageFile(folderName, file, innerCallback);
     }, persistImageFilesCallback(undefined));*/

    // Object.keys
    if(!_.isEmpty(files)) {
        var keys = Object.keys(files);

        for (var i = 0; i < keys.length; ++i) {
            var file = files[keys[i]];
            persistImageFile(folderName, file, persistImageFilesCallback);
        }
    }

    persistImageFilesCallback(undefined);
};

/**
 * Create images' directories if they were not created.
 * @param folderName - Folder's name
 * @param createImageDirectoryCallback
 */
var createImageDirectory = function (folderName, createImageDirectoryCallback) {

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
            });
            callback(undefined, fullsizeImagePath);
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
            });
            callback(undefined, thumbImagePath);
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
        createImageDirectory: async.apply(createImageDirectory, folderName),

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
                logger.debug('Image successfully deleted');
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

    var imageFolderPath = getFolderImagePath();
    var fullsizeImagePath = getMainImagePath(folderName, "");
    var thumbImagePath = getThumbImagePath(folderName, "");

    var flow = {
        deleteFullsizeImageFolder: function (callback) {
            fs.exists(fullsizeImagePath, function (exist) {
                if (!exist) {
                    fs.rmdir(fullsizeImagePath, function (err) {
                        if (err) {
                            return deleteDirectoriesCallback(err);
                        }
                        callback(undefined);
                    });
                }
            });
            callback(undefined, fullsizeImagePath);
        },
        deleteThumbImageFolder: ['deleteFullsizeImageFolder', function (callback) {
            fs.exists(thumbImagePath, function (exist) {
                if (!exist) {
                    fs.rmdir(thumbImagePath, function (err) {
                        if (err) {
                            return deleteDirectoriesCallback(err);
                        }
                        callback(undefined);
                    });
                }
            });
            callback(undefined, thumbImagePath);
        }],

        deleteImageFolder: ['deleteFullsizeImageFolder', 'deleteThumbImageFolder', function (callback) {
            fs.exists(imageFolderPath, function (exist) {
                if (!exist) {
                    fs.rmdir(imageFolderPath, function (err) {
                        if (err) {
                            return deleteDirectoriesCallback(err);
                        }
                        callback(undefined);
                    });
                }
            });
            callback(undefined, imageFolderPath);
        }]
    };

    async.auto(flow, function (error, results) {
        if (error) {
            return deleteDirectoriesCallback(error);
        }
        if(results.createFullsizeImageFolder) {
            logger.debug('directory deleted: ' + results.createFullsizeImageFolder);
        }
        if(results.createThumbImageFolder) {
            logger.debug('directory deleted: ' + results.createThumbImageFolder);
        }
        if(results.deleteImageFolder) {
            logger.debug('directory deleted: ' + results.deleteImageFolder);
        }
        deleteDirectoriesCallback(undefined);
    });
};

/**
 * Delete image file.
 * @param folderName the folder name
 * @param imageName the image name
 * @param deleteProcessCallback
 */
var deleteImageFile = function (folderName, imageName, deleteProcessCallback) {

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
        },
        function () {
            deleteProcessCallback(null, imageName);
        }
    ]);
};

/**
 * Delete one or more image (file) in the folder's entity
 * @param folderName
 * @param files
 * @param callback
 */
var deleteImageFiles = function (folderName, files, callback) {

    if (_.isEmpty(files)) {
        return callback(undefined);
    }

    // Object.keys
    var keys = Object.keys(files);

    for (var i = 0; i < keys.length; ++i) {
        var image = files[keys[i]];
        deleteImageFile(folderName, image.name, callback);
    }
};

/**
 * Delete file images for one model.
 * @param folderName the name of the folder
 * @param callback callback for the async auto
 * @param results results obtained from the last function in async
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

    //Represent an array of resources ids which are found in imagesFromDB Array
    var result = imagesFromDB.filter(function (item) {
        return resourcesIds.filter(function (id) {
                return item._id == id;
            }).length === 0;
    });

    logger.debug('The following images should be deleted. ');
    logger.debug(JSON.stringify(result));

    callback(undefined, result);
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
        var urlPath = getMainImagePath(folderName, file.originalname);
        var thumbnailUrlPath = getThumbImagePath(folderName, file.originalname);

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
        for (var j = 0; j < imagesDataToBeDeleted.length; j++) {
            model.images[j].remove();
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

/** ------------------------------ Update Model Flow ------------------------------------------ **/

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
    var resourcesIds = JSON.parse(request.body.resourcesIds);

    var folderName = model.name;

    var flow = {

        //If the name of the plant (Model) changes, the folder's image path should be updated.
        updateImageFolderName: async.apply(updateImageFolderName, oldFolderName, request.body.name),

        // Get images data from request in order to update images data from Model
        getImagesDataFromRequest: ['updateImageFolderName', function (callback) {

            logger.debug( ' Getting image data from files ');

            getImageData(model.name, request.files, request.body.mainImage, function (err, data) {
                if (err) {
                    return callback(err);
                }
                callback(undefined, data);
            });
        }],

        // Persist each new image file
        persistImagesFiles: ['getImagesDataFromRequest', async.apply(persistImageFiles, folderName, request.files)],

        // Check resources ids in order to decide if one of them should be deleted
        getImagesDataToBeDelete: async.apply(verifyIfImagesShouldBeDeleted, imagesFromDB, resourcesIds),

        // Delete files whose resource id doesn't exist any more. The data of resources ids comes
        // from results.getImagesDataToBeDelete and inject in deleteImagesFiles function
        deleteImagesFiles: ['getImagesDataToBeDelete', async.apply(deleteImageFilesProcess, folderName)],

        // Update images data from the model
        updateImagesDataFromModel: ['getImagesDataFromRequest', 'getImagesDataToBeDelete', 'deleteImagesFiles', async.apply(updateModel, model)],

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
    createProcessImageFiles: createProcessImageFiles
};


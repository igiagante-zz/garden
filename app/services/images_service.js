/**
 * Created by igiagante on 22/3/16.
 */

var fs = require('extfs'),
    logger = require('../utils/logger'),
    async = require('async'),
    im = require('imagemagick'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    logger = require('../utils/logger'),
    path = require('path'),
    mkdir = require('mkdir-p');

var parentDir = path.resolve(process.cwd(), '..');
var pathImagesUploaded = parentDir + '/public/images/uploads/';

var getMainImagePath = function(folderName, imageFileName) {
    return pathImagesUploaded + folderName + '/fullsize/' + imageFileName;
};

var getThumbImagePath = function(folderName, imageFileName) {
    return pathImagesUploaded + folderName + '/thumb/' + imageFileName;
};

/**
 * Resize image size.
 * @param folderName - the folder name
 * @param imageFileName - the original file name
 * @param resizeImageCallback - Callback to communicate if the exit was successful
 */
var resizeImage = function(folderName, imageFileName, resizeImageCallback){

    var mainPath = getMainImagePath(folderName, imageFileName);
    var thumbPath = getThumbImagePath(folderName, imageFileName);

    im.resize({ srcPath: mainPath, dstPath: thumbPath, width: 200 },

        function(err, stdout, stderr){

            if (err) {
                logger.error('The thumbnail image could not be saved');
                return resizeImageCallback(err);
            }
            resizeImageCallback(null);
        });
};


/**
 * Create images' directories if they were not created.
 * @param directories - names directories
 * @param created - indicate if
 * @param createImageDirectoryCallback
 */
var createImageDirectory = function(directories, created, createImageDirectoryCallback){

    var iterator = function(d, cb){
        mkdir(d, cb);
    };

    if(created) {
        logger.debug('directories are already created');
        createImageDirectoryCallback(null);
    }else{
        async.each(directories, iterator, function(err){
            if (err)
                return createImageDirectoryCallback(err + ' could not be created');
            logger.debug('directories created');
            createImageDirectoryCallback(null);
        });
    }
};


/**
 * Check if images' directories are already created.
 * @param folderName the name of folder which contains the images.
 * @param existDirectoriesCallback
 */
var checkIfImageDirectoriesExist = function(folderName, existDirectoriesCallback){

    var mainPath = pathImagesUploaded + folderName;
    var fullsizeImagePath = getMainImagePath(folderName, "");
    var thumbImagePath = getThumbImagePath(folderName, "");

    //It's important the order of these directories!!
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

    async.each(directories, iterator, function(err){
        if (err) return existDirectoriesCallback(err);
        existDirectoriesCallback(null, directories, created);
    });
};

/**
 * Rename the image path file.
 * @param image
 * @param newPath
 * @param readImageFileCallback
 */
var renameImageFilePath = function(image, newPath, readImageFileCallback){

    fs.readFile(image.path, function (err, data) {
        fs.rename(image.path, newPath);
        readImageFileCallback(null, data);
    });
};

/**
 * Write the Image data into a file.
 * @param newPath
 * @param writeImageCallback
 */
var writeImageFile = function(data, newPath, writeImageCallback){

    fs.writeFile(newPath, data, function (err) {
        if(err) {
            logger.error(' The data could not be persisted ' + err);
            return writeImageCallback(err);
        }
        writeImageCallback(null);
    });
};


/**
 * Delete a file.
 * @param path the path file
 * @param removeFileCallback
 */
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

/**
 * Delete images directory.
 * @param folderName
 * @param deleteDirectoriesCallback
 */
var deleteImageDirectories = function(folderName, deleteDirectoriesCallback){

    var fullsizePath = getMainImagePath(folderName, "");
    var thumbsPath = getThumbImagePath(folderName, "");

    logger.debug('Delete directories');

    var ifExistDirDelete = function(path, callback){
        fs.exists(path, function(exists){
            if(exists){
                fs.rmdir(path, function(err){
                    if(err){
                        logger.debug('Fail delete directory');
                        logger.debug(err);
                    }
                    callback(undefined);
                });
            }else{
                callback(undefined);
            }
        });
    };

    fs.isEmpty(fullsizePath, function(empty){
        if(empty) {
            //the order of the directories are important!
            var directories = [fullsizePath, thumbsPath, pathImagesUploaded];

            async.each(directories, ifExistDirDelete, function(err){
                if (err) return deleteDirectoriesCallback(err);
                deleteDirectoriesCallback(undefined);
            });
        } else {
            deleteDirectoriesCallback(undefined);
        }
    });
};

/**
 * Persist image file.
 * @param folderName
 * @param image Image File
 * @param mainCallback
 */
var persistImageFile = function(folderName, image, mainCallback) {

    var newPath = getMainImagePath(folderName, image.originalname);

    async.waterfall([

        function(callback) {
            logger.debug('Check if directories were created before');
            checkIfImageDirectoriesExist(folderName, callback);
        },
        function(directories, created, callback) {
            logger.debug('Creating directories');
            createImageDirectory(directories, created, callback);
        },
        function(callback) {
            logger.debug('Reading image file');
            renameImageFilePath(image, newPath, callback);
        },
        function(data, callback) {
            logger.debug('Writing image file');
            writeImageFile(data, newPath, callback);
        },
        function(callback) {
            logger.debug('Resize image to create a thumbnail');
            resizeImage(folderName, image.originalname, callback);
        },
        function(callback) {
            mainCallback(null, image);
        }
    ], function (err, result) {
        logger.error('err = ', err);
        if(err)
            mainCallback(err);
    });
};

/**
 * Delete image file.
 * @param folderName the folder name
 * @param imageName the image name
 * @param deleteProcessCallback
 */
var deleteImageFile = function(folderName, imageName, deleteProcessCallback){

    async.series([
        function(callback){
            logger.debug('Remove thumbnail file');
            var thumbsPath = getThumbImagePath(folderName, imageName);
            removeFile(thumbsPath, callback);
        },
        function(callback){
            logger.debug('Remove full size file');
            var fullsizePath = getMainImagePath(folderName, imageName);
            removeFile(fullsizePath, callback);
        },
        function(callback){
            logger.debug('Remove directories in case they don\'t contain more images');
            deleteImageDirectories(folderName, callback);
        },
        function(callback) {
            deleteProcessCallback(null, imageName);
        }
    ]);
};

/**
 * Persist each image in the folder's enity
 * @param folderName
 * @param files
 * @param callback
 */
var persistImageFiles = function(folderName, files, callback) {
    // Object.keys
    var keys = Object.keys(files);

    for (var i = 0; i < keys.length; ++i) {
        var file = files[keys[i]];
        persistImageFile(folderName, file, callback);
    }
};

/**
 * Persist images for one model.
 * @param folderName the folder name
 * @param files the files to be persisted
 * @param callback
 */
var persistImages = function(folderName, files, callback){
    persistImageFiles(folderName, files, function(err, result) {
        if(err){
            logger.debug(' One image could not be saved ' + err);
            return callback(err);
        }
        logger.debug(' the image was persisted successfully ' + result);
        callback(undefined, result);
    });
};

/**
 * Verify if one or more images should be deleted from database.
 * @param imagesFromDB
 * @param resourcesIds
 * @param callback
 * @returns {Array}
 */
var verifyIfImagesShouldBeDeleted = function(imagesFromDB, resourcesIds, callback) {

    var result = [];

    _.forEach(imagesFromDB, function (imageData, key1) {
        _.forEach(resourcesIds, function (id, key2) {
            if (imageData.id === id) {
                result.push(imageData);
            }
        });
    });

    callback(undefined, result);
};

/**
 * Delete one or more image (file) in the folder's entity
 * @param folderName
 * @param files
 * @param callback
 */
var deleteImageFiles = function(folderName, files, callback) {

    if(_.isEmpty(files)){
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
var deleteImagesFiles = function(folderName, callback, results){
    //delete images for one model
    deleteImageFiles(folderName, results.getImagesDataToBeDelete, function(err, result) {
        if(err){
            logger.debug(' One image could not be deleted ' + err);
            return callback(err);
        }
        logger.debug(' the image was deleted successfully ' + result);
        callback(undefined, result);
    });
};

/**
 * Update images doc from one Model.
 * @param model The model where the images belong to.
 */
var updateImagesDataFromModel = function(model, callback, results){
    model.images = _.differenceBy(model.images, results.getImagesDataToBeDelete, 'id');
    callback(undefined);
};

/** ------------------------------ Update Model Flow ------------------------------------------ **/

/**
 * Convert files data into json array
 * @param folderName the folder name
 * @param files
 * @param main Indicates if the image is the main image of the folder.
 * @param callback
 * @returns {Array}
 */
var getImageData = function(folderName, files, main, callback) {

    if(_.isEmpty(files))
        return callback(undefined);

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
        data.url =  urlPath;
        data.name = file.originalname;

        var fileName  = _.split(file.originalname, '.', 2);

        data.thumbnailUrl = thumbnailUrlPath;
        data.type = file.mimetype;
        data.size = file.size;
        data.main = main === fileName[0];

        imageData.push(data);
    }

    callback(undefined, imageData);
};

/**
 * Each entity which contains images, can use this process to update its images.
 * @param request
 * @param model The schema which update the document
 * @param callback
 */
var processImageUpdate = function(request, model, callback) {

    //convert model to json and then to Array
    var imagesFromDB = JSON.parse(JSON.stringify(model.images));

    //obtain resourcesIds in order to check if some picture needs to be updated
    var resourcesIds = request.body.resourcesIds;

    var imagesDoc = null;
    var folderName = model.name;

    var flow = {

        getImagesDataFromRequest: function (callback) {
            getImageData(model.name, request.files, request.body.main, function(err, data){
                if(err)
                    return callback(err);
                imagesDoc = data;
                callback(undefined, data)
            });
        },
        persistImages: ['getImagesDataFromRequest', async.apply(persistImages, folderName, files)],
        getImagesDataToBeDelete: async.apply(verifyIfImagesShouldBeDeleted, imagesFromDB, resourcesIds),
        deleteImagesFiles: ['getImagesToBeDelete', async.apply(deleteImagesFiles, folderName)],
        deleteImages: ['getImagesToBeDelete', async.apply(updateImagesDataFromModel, model)],
        save: ['persistImages', 'deleteImages', function (callback) {

            model.save(function (err) {
                callback(err, model);
            });

            callback(undefined, model);
        }]
    };

    async.auto(flow, function (error, results) {
        if (error) {
            return callback(error);
        }
        callback(undefined, model);
    });
};
/** ------------------------------ Update Flow Finish ------------------------------------------ **/

module.exports = {
    getImageData: getImageData,
    resizeImage: resizeImage,
    createImageDirectory: createImageDirectory,
    checkIfImageDirectoriesExist: checkIfImageDirectoriesExist,
    renameImageFilePath: renameImageFilePath,
    writeImageFile: writeImageFile,
    removeFile: removeFile,
    deleteImageDirectories: deleteImageDirectories,
    persistImageFile: persistImageFile,
    deleteImageFile: deleteImageFile,
    verifyIfImagesShouldBeDeleted: verifyIfImagesShouldBeDeleted,
    processImageUpdate: processImageUpdate,
    persistImageFiles: persistImageFiles
};


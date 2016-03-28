/**
 * Created by igiagante on 22/3/16.
 */

var fs = require('fs'),
    logger = require('../utils/logger'),
    async = require('async'),
    im = require('imagemagick')
    mongoose = require('mongoose'),
    _ = require('lodash'),
    path = require('path');

var parentDir = path.resolve(process.cwd(), '..');
var pathImagesUploaded = parentDir + '/public/images/uploads/';

var getMainImagePath = function(folderName, imageFileName) {
    return pathImagesUploaded + folderName + '/fullsize/' + imageFileName;
};

var getThumbImagePath = function(folderName, imageFileName) {
    return pathImagesUploaded + folderName + '/thumb/' + imageFileName;
};

/**
 * Convert files data into json array
 * @param plantName name of the plant
 * @param files
 * @param forPlant Inform if the images belong to one plant.
 * @param main Indicates if the image is the main image of the folder.
 * @returns {Array}
 */
var getImageData = function(plantName, files, forPlant, main) {

    var imageData = [];

    // Object.keys
    var keys = Object.keys(files);

    for (var i = 0; i < keys.length; ++i) {

        var file = files[keys[i]];

        //paths to urls
        var urlPath = getMainImagePath(plantName, file.originalname);
        var thumbnailUrlPath = getThumbImagePath(plantName, file.originalname);

        var data = {};
        data._id = mongoose.Types.ObjectId();
        data.url =  urlPath;

        var fileName  = _.split(file.originalname, '.', 2);

        if(forPlant) {
            data.thumbnailUrl = thumbnailUrlPath;
            data.name = file.name;
            data.type = file.mimetype;
            data.size = file.size;
            data.main = main === fileName[0];
        }

        imageData.push(data);
    }

    return imageData;
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
        fs.mkdir(d, cb);
    };

    if(created) {
        logger.debug('directories are already created');
        createImageDirectoryCallback(null);
    }else{
        async.each(directories, iterator, function(err){
            if (err) return createImageDirectoryCallback(err + ' could not be created');
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
 * @param data
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

    var fullsizePath = getMainImagePath(folderName, null);
    var thumbsPath = getThumbImagePath(folderName, null);

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
 * Verify if one or more images should be deleted from database.
 * @param imagesFromDB
 * @param images
 * @returns {Array}
 */
var verifyIfImagesShouldBeDeleted = function(imagesFromDB, images) {

    return _.differenceBy(imagesFromDB, images, '_id');
};

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
    verifyIfImagesShouldBeDeleted: verifyIfImagesShouldBeDeleted
};


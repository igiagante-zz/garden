var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	im = require('imagemagick');

var upload = function(image, callback){

	fs.readFile(image.path, function (err, data) {
		if(err) {
			callback(err);
		}
		var newPath = __dirname + "/uploads/fullsize/" + image.name;

		var thumbPath = __dirname + "/uploads/thumbs/" + image.name;

		var images = [];

		/// write file to uploads/fullsize folder
		fs.writeFile(newPath, data, function (err) {
			if(err) {
				logger.debug('todo mal ------ ' + err)
				return callback(err);
			}
			console.log('write file to uploads/fullsize folder')

			Img.create({ kind: "detail", url: newPath}, function(err, imageDetail) {
				if(err) {
					console.log('The full image couldnt be saved');
					return callback(err);
				}
				//adding imageDetail to images array
				images.push(imageDetail);

				return callback(undefined, images);				
			});	
		});
		 
	});
};


module.exports = {
	upload : upload
}
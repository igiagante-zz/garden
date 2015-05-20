var Img = require('../models/image.js'),
	fs = require('fs'),
	logger = require('../utils/logger'),
	im = require('imagemagick');

var upload = function(image, mainImage, callback){

	fs.readFile(image.path, function (err, data) {
		if(err) {
			callback(err);
		}

		var newPath = "/Users/igiagante/projects/garden/images/uploads/fullsize/" + image.originalname;

		var thumbPath = "/Users/igiagante/projects/garden/images/uploads/thumbs/"  + image.originalname;

		var images = [];

		fs.rename(image.path, newPath);

		/// write file to uploads/fullsize folder
		fs.writeFile(newPath, data, function (err) {

			console.log('write file .......')

			if(err) {
				logger.debug('todo mal ------ ' + err)
				return callback(err);
			}

			console.log('write file to uploads/fullsize folder')

			Img.create({ kind: "detail", url: newPath, main: mainImage}, function(err, imageDetail) {
				if(err) {
					console.log('The full image couldnt be saved');
					return callback(err);
				}
				//adding imageDetail to images array
				images.push(imageDetail.id);

				console.log(' image fullsize uploaded ' + image.originalname);

				console.log(' resizing fullsize uploaded ' + image.originalname);

				im.resize({ srcPath: newPath, dstPath: thumbPath, width: 200 }, 

				function(err, stdout, stderr){
				
					if (err) {
						console.log('The thumbnail image couldnt be saved');
						return callback(err);
					}
			  
			  		console.log('resized image to fit within 200x200px');
				});

				Img.create({ kind: "thumbnail", url: thumbPath, main: mainImage }, function(err, imageThumb){
					
					if(err) {
						console.log('The thumb image couldnt be saved');
						return callback(err);
					}	

					//adding imageThumb.id to images array
					images.push(imageThumb.id);		

					console.log('imageThumb.id : ' + imageThumb.id)	;		
				});

				return callback(undefined, images);				
			});	
		});
		 
	});
};


module.exports = {
	upload : upload
}
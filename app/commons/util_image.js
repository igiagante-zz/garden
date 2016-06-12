/**
 * @author Ignacio Giagante, on 8/6/16.
 */

"use strict";

var exposeImagesPath = function(items, res) {

    for(var i = 0; i < items.length; i++) {

        var item = items[i];
        item.imageUrl = "http://192.168.0.101:3000" + item.imageUrl;
    }
    return res.json(item);
};

module.exports = {
    exposeImagesPath: exposeImagesPath
};
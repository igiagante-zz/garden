/**
 * Created by igiagante on 28/4/16.
 */

'use strict';

var mongoose = require('mongoose');

var plant = {

    _id: new mongoose.Types.ObjectId,
    name: 'mango',
    size: 30,
    phSoil: 6,
    ecSoil: 1.3,
    harvest: 60,
    irrigations: [],
    gardenId: "57164dd6962d5cca28000002",
    images: [
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/mango',
            thumbnailUrl: '/images/thumbnail/mango',
            name: 'mango',
            type: 'jpg',
            size: 1234,
            main: true
        },
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/mango_2',
            thumbnailUrl: '/images/thumbnail/mango_2',
            name: 'mango_2',
            type: 'jpg',
            size: 1234,
            main: false
        }
    ]
};


module.exports = {
    plant: plant
};

/**
 * @author Ignacio Giagante, on 7/4/16.
 */

var mongoose = require('mongoose');

var nutrient = {
    _id: new mongoose.Types.ObjectId,
    name: 'delta',
    ph: 6.5,
    npk: '3-4-5',
    description: 'The best in the world',
    images: [
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/flora',
            thumbnailUrl: '/images/thumbnail/flora',
            name: 'flora',
            type: 'jpg',
            size: 1234,
            main: true
        },
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/flora_2',
            thumbnailUrl: '/images/thumbnail/flora_2',
            name: 'flora_2',
            type: 'jpg',
            size: 1234,
            main: false
        }
    ]
};

module.exports = {
  nutrient: nutrient
};
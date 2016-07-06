/**
 * @author Ignacio Giagante, on 28/4/16.
 */

'use strict';

var mongoose = require('mongoose');

var plantOne = {

    _id: new mongoose.Types.ObjectId,
    name: 'mango',
    size: 30,
    phSoil: 6,
    ecSoil: 1.3,
    harvest: 60,
    irrigations: [],
    gardenId: '57164dd6962d5cca28000002',
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

var plantTwo = {

    _id: new mongoose.Types.ObjectId,
    name: 'salvia',
    size: 50,
    phSoil: 7,
    ecSoil: 1.0,
    harvest: 100,
    irrigations: [],
    gardenId: '57164dd6962d5cca28000002',
    images: [
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/salvia',
            thumbnailUrl: '/images/thumbnail/salvia',
            name: 'salvia',
            type: 'jpg',
            size: 1234,
            main: true
        },
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/salvia',
            thumbnailUrl: '/images/thumbnail/salvia',
            name: 'salvia',
            type: 'jpg',
            size: 1234,
            main: false
        }
    ]
};

var plantThree = {

    _id: new mongoose.Types.ObjectId,
    name: 'mimosa',
    size: 20,
    phSoil: 6.5,
    ecSoil: 0.7,
    harvest: 80,
    irrigations: [],
    gardenId: '57164dd6962d5cca28000003',
    images: [
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/mimosa',
            thumbnailUrl: '/images/thumbnail/mimosa',
            name: 'mimosa',
            type: 'jpg',
            size: 1234,
            main: true
        },
        {
            _id: new mongoose.Types.ObjectId,
            url: '/images/fullsize/mimosa',
            thumbnailUrl: '/images/thumbnail/mimosa',
            name: 'mimosa',
            type: 'jpg',
            size: 1234,
            main: false
        }
    ]
};

module.exports = {
    plantOne: plantOne,
    plantTwo: plantTwo,
    plantThree: plantThree
};

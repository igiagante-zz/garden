/**
 * Created by igiagante on 6/7/16.
 */

'use strict';

var utils = require('../utils'),
    should = require('should'),
    Plant = require("../../app/models/plant"),
    Garden = require("../../app/models/garden"),
    plantProvider = require('./../providers/plant'),
    gardenProvider = require('./../providers/garden'),
    GardenService = require('../../app/services/garden_service'),
    should = require('should');

describe('Test Garden Service', function () {

    Garden.collection.drop();
    Plant.collection.drop();

    var gardenIdOne;
    var gardenIdTwo;

    beforeEach(function (done) {

        Garden.create(gardenProvider.gardenOne, function (err, createdGarden) {
            if(err) {
                console.log('err', err);
            }
            gardenIdOne = createdGarden.gardenId;
        });

        plantProvider.plantOne.gardenId = gardenIdOne;
        plantProvider.plantTwo.gardenId = gardenIdOne;

        Garden.create(gardenProvider.gardenTwo, function (err, createdGarden) {
            gardenIdTwo = createdGarden.gardenId;
        });

        plantProvider.plantThree.gardenId = gardenIdTwo;

        Plant.create(plantProvider.plantOne, function (err, createdPlant) {

        });

        Plant.create(plantProvider.plantTwo, function (err, createdPlant) {

        });

        Plant.create(plantProvider.plantThree, function (err, createdPlant) {

            done();
        });
    });

    afterEach(function (done) {
        Garden.collection.drop();
        Plant.collection.drop();
        done();
    });

    it('should return a list of garden with their plants', function (done) {

        GardenService.getGardensWithPlants(function(err, gardens) {
            // Confirm that that an error does not exist
            should.not.exist(err);

            gardens.should.have.length(2);
            gardens[0].plants.should.have.length(2);
            gardens[1].plants.should.have.length(1);


        });

        done();
    });
});

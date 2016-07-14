/**
 * Created by igiagante on 6/7/16.
 */

'use strict';

var utils = require('../utils'),
    should = require('should'),
    Plant = require("../../app/models/plant"),
    plantProvider = require('./../providers/plant'),
    PlantService = require('../../app/services/plant_service'),
    should = require('should');

describe('Test Plant Service', function () {

    Plant.collection.drop();

    var gardenId;
    var plantId;

    beforeEach(function (done) {

        Plant.create(plantProvider.plantOne, function (err, createdPlant) {
            gardenId = createdPlant.gardenId;
            plantId = createdPlant.plantId;
        });

        Plant.create(plantProvider.plantTwo, function (err, createdPlant) {
            gardenId = createdPlant.gardenId;
            done();
        });
    });

    afterEach(function (done) {
        Plant.collection.drop();
        done();
    });

    it('should return a list of plant which belong to the same garden', function (done) {

        PlantService.getPlantsByGardenId(gardenId, function(err, plants) {
            // Confirm that that an error does not exist
            should.not.exist(err);

            plants.should.have.length(2);
        });

        done();
    });

    it('should return a list of resources ids images', function (done) {

        PlantService.getResourcesIdsImagesForPlant(plantId, function(err, resourcesIds) {
            // Confirm that that an error does not exist
            should.not.exist(err);

            resourcesIds.should.have.length(2);
        });

        done();
    });
});

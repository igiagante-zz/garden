/**
 * Created by igiagante on 1/7/16.
 */

'use strict';

var utils = require('../utils'),
    should = require('should'),
    Plant = require("../../app/models/plant"),
    plantProvider = require('./../providers/plant'),
    ImageService = require('../../app/services/images_service'),
    should = require('should');

describe('Test Image Service', function () {

    Plant.collection.drop();

    var plantId;

    beforeEach(function (done) {

        Plant.create(plantProvider.plant, function (err, createdPlant) {
            plantId = createdPlant.id;
            done();
        });
    });

    afterEach(function (done) {
        Plant.collection.drop();
        done();
    });

    it('should return a list of resources ids images', function (done) {

        ImageService.getResourcesIdsImages(plantId, function(err, resourcesIds) {
            // Confirm that that an error does not exist
            should.not.exist(err);

            resourcesIds.should.have.length(2);
        });

        done();
    });
});

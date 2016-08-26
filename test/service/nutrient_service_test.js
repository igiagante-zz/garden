/**
 * Created by igiagante on 14/7/16.
 */

'use strict';

var Nutrient = require("../../app/models/nutrient"),
    nutrientProvider = require('./../providers/nutrient'),
    nutrientService = require('../../app/services/nutrient_service'),
    should = require('should');

describe('Test Nutrient Service', function () {

    Nutrient.collection.drop();

    var name;
    var _id;

    beforeEach(function (done) {

        Nutrient.create(nutrientProvider.nutrient, function (err, createdNutrient) {
            name = createdNutrient.name;
            _id = createdNutrient.id;
        });
        done();
    });

    afterEach(function (done) {
        Nutrient.collection.drop();
        done();
    });

    it('should return the nutrient id', function (done) {

        nutrientService.getNutrientId(name, function(err, id) {
            // Confirm that that an error does not exist
            should.not.exist(err);

            id.should.equal(_id);
        });
        done();
    });
});

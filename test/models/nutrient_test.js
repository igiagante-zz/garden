/**
 * Created by igiagante on 4/4/16.
 */

'use strict';

// import the moongoose helper utilities
var utils = require('../utils');
var should = require('should');
// import our User mongoose model
var Nutrient = require('../../app/models/nutrient');


describe('Test nutrient model', function () {

    describe('#create()', function () {
        it('should create a new Nutrient', function (done) {
            // Create a User object to pass to User.create()
            var nutrient = {
                name: 'delta',
                ph: 6.5,
                npk: '3-4-5',
                description: 'The best in the world',
                images: [
                    {
                        url: '/images/fullsize/nutrient',
                        thumbnailUrl: '/images/thumbnail/nutrient',
                        name: 'nutrient',
                        type: 'jpg',
                        size: 1234,
                        main: true
                    },
                    {
                        url: '/images/fullsize/nutrient_2',
                        thumbnailUrl: '/images/thumbnail/nutrient_2',
                        name: 'nutrient',
                        type: 'jpg',
                        size: 1234,
                        main: false
                    }
                ]
            };

            Nutrient.create(nutrient, function (err, createdNutrient) {

                // Confirm that that an error does not exist
                should.not.exist(err);

                // verify that the returned user is what we expect
                createdNutrient.name.should.equal('delta');
                createdNutrient.ph.should.equal(6.5);
                createdNutrient.npk.should.equal('3-4-5');
                createdNutrient.description.should.equal('The best in the world');

                createdNutrient.images[0].url.should.be.equal('/images/fullsize/nutrient');
                createdNutrient.images[0].main.should.be.true
                createdNutrient.images[1].url.should.be.equal('/images/fullsize/nutrient_2');
                createdNutrient.images[1].main.should.be.false

                createdNutrient.images.should.have.length(2);

                // Call done to tell mocha that we are done with this test
                done();
            });
        });
    });
});

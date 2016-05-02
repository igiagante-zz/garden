/**
 * Created by igiagante on 7/4/16.
 */


process.env.NODE_ENV = 'test';

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    mongoose = require("mongoose"),
    server = require('../../app/server'),
    Nutrient = require("../../app/models/nutrient"),
    nutrientProvider = require('./../providers/nutrient'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    Should = require('chai').Should(),
    fs = require('fs');

//var should = chai.should();
chai.use(chaiHttp);


describe('Nutrients', function () {

    Nutrient.collection.drop();

    var nutrientId;

    beforeEach(function (done) {

        Nutrient.create(nutrientProvider.nutrient, function (err, createdNutrient) {
            nutrientId = createdNutrient.id;
            done();
        });

    });

    afterEach(function (done) {
        Nutrient.collection.drop();
        done();
    });

    it('should list ALL nutrients on / GET', function (done) {
        chai.request(server)
            .get('/api/nutrient')
            .end(function (err, res) {
                res.should.be.json;
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0].should.have.property('ph');
                done();
            });
    });

    it('should list one nutrient on /api/nutrient/id GET', function (done) {

        chai.request(server)
            .get('/api/nutrient/' + nutrientId)
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('_id');
                res.body.should.have.property('name');
                res.body.should.have.property('ph');
                done();
            });
    });
});
/**
 * Created by igiagante on 7/4/16.
 */


process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require("mongoose");

var server = require('../app/server');
var Nutrient = require("../app/models/nutrient"),
    nutrientProvider = require('./providers/nutrient'),
    sinon = require('sinon'),
    rewire = require('rewire');


var Should = require('chai').Should();
var fs = require('fs');

//var should = chai.should();
chai.use(chaiHttp);


describe('Nutrients', function() {

    Nutrient.collection.drop();

    var nutrientId;

    beforeEach(function(done){

        Nutrient.create(nutrientProvider.nutrient, function (err, createdNutrient) {
            nutrientId = createdNutrient.id;
            done();
        });

    });

    afterEach(function(done){
        Nutrient.collection.drop();
        done();
    });

    it('should list ALL nutrients on / GET', function(done) {
        chai.request(server)
            .get('/api/nutrient')
            .end(function(err, res){
                res.should.be.json;
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0].should.have.property('ph');
                done();
            });
    });

    it('should list SINGLE nutrient on /api/nutrient/<id> GET', function(done) {

        chai.request(server)
            .get('/api/nutrient/' + nutrientId)
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('_id');
                res.body.should.have.property('name');
                res.body.should.have.property('ph');
                done();
            });
    });

    it.only('should update a SINGLE nutrient on /api/nutrient/<id> PUT', function(done) {

        var parentDir = path.resolve(process.cwd(), '..');
        var pathToImage = parentDir + '/test/images/romero.jpg';

        var image;

        fs.readFile(pathToImage, function (err, data) {
            if (err) {
                throw err;
            }
            image = data;
        });

        chai.request(server)
            .get('/api/nutrient/')
            .end(function(err, res){
                chai.request(server)
                    .put('/api/nutrient/' + res.body[0]._id)
                    .send({'name': 'delta 2'})
                    .end(function(error, response){
                        response.should.have.status(200);
                        response.should.be.json;
                        response.body.should.be.a('object');
                        response.body.should.have.property('UPDATED');
                        response.body.UPDATED.should.be.a('object');
                        response.body.UPDATED.should.have.property('name');
                        response.body.UPDATED.should.have.property('_id');
                        response.body.UPDATED.name.should.equal('delta 2');
                        done();
                    });
            });
    });

});
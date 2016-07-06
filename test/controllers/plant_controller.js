/**
 * @author Ignacio Giagante, on 28/4/16.
 */

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require("mongoose");

var server = require('../../app/server');
var Plant = require("../../app/models/plant"),
    plantProvider = require('./../providers/plant'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    should = require('chai').Should(),
    fs = require('fs');

chai.use(chaiHttp);

describe('Plant Controller', function() {

    Plant.collection.drop();

    var plantId;
    var plantName;

    beforeEach(function(done){

        Plant.create(plantProvider.plantOne, function (err, createdPlant) {
            plantId = createdPlant.id;
            plantName = createdPlant.name;
            done();
        });
    });

    afterEach(function(done){
        Plant.collection.drop();
        done();
    });

    it('should list ALL plants on /api/plant GET', function(done) {
        chai.request(server)
            .get('/api/plant')
            .end(function(err, res){

                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body[0].should.have.property('id');
                res.body[0].should.have.property('name');
                res.body[0].should.have.property('phSoil');
                res.body[0].should.have.property('ecSoil');
                res.body[0].should.have.property('size');
                res.body[0].should.have.property('harvest');
                res.body[0].should.have.property('images');
                res.body[0].images.should.be.a('array');
                res.body[0].images.length.should.equals(2);

                done();
            });
    });

    it('should list one plant on /api/plant/id GET', function(done) {
        chai.request(server)
            .get('/api/plant/' + plantId)
            .end(function(err, res){

                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('id');
                res.body.should.have.property('name');
                res.body.should.have.property('phSoil');
                res.body.should.have.property('ecSoil');
                res.body.should.have.property('size');
                res.body.should.have.property('harvest');
                res.body.should.have.property('images');
                res.body.images.should.be.a('array');
                res.body.images.length.should.equals(2);

                done();
            });
    });

    it('should delete one plant on /api/plant/id DELETE', function(done) {
        chai.request(server)
            .delete('/api/plant/' + plantId)
            .end(function(err, res){

                res.should.have.status(202);
                //res.text.should.be.equals('{\"message\":\" The plant with id 57756a10dd10525d70000001 was deleted. \"}');

                done();
            });
    });

    it('should create one plant on /api/plant POST', function(done) {

        chai.request(server)
            .post('/api/plant')
            .field('id', '1234')
            .field('name', 'mango3')
            .field('phSoil', '123')
            .field('ecSoil', '123')
            .field('harvest', '123')
            .field('gardenId', '57164dd6962d5cca28000002')
            .field('size', '30')
            .attach('fileOne', fs.readFileSync(__dirname + '/images/mango1.jpg'), 'mango1.jpg')
            .attach('fileTwo', fs.readFileSync(__dirname + '/images/mango2.jpg'), 'mango2.jpg')

            .end(function(err, res){

                if(err) {
                    console.log('error : ' + err);
                }

                res.should.have.status(200);
                res.should.be.json;

                res.body.should.be.a('object');
                res.body.should.have.property('id');
                res.body.should.have.property('name');
                res.body.should.have.property('phSoil');
                res.body.should.have.property('ecSoil');
                res.body.should.have.property('size');
                res.body.should.have.property('harvest');
                res.body.should.have.property('images');
                res.body.images.should.be.a('array');
                res.body.images.length.should.equals(2);

                done();
            });
    });

    it('should try to create a plant that already exit.', function(done) {

        chai.request(server)
            .post('/api/plant')
            .field('id', '1234')
            .field('name', 'mango3')
            .field('phSoil', '123')
            .field('ecSoil', '123')
            .field('harvest', '123')
            .field('gardenId', '57164dd6962d5cca28000002')

            .end(function(err, res){

                if(err) {
                    console.log('error : ' + err);
                }

                chai.request(server)
                    .post('/api/plant')
                    .field('id', '1234')
                    .field('name', 'mango3')
                    .field('phSoil', '123')
                    .field('ecSoil', '123')
                    .field('harvest', '123')
                    .field('gardenId', '57164dd6962d5cca28000002')

                    .end(function(err, res){

                        if(err) {
                            console.log('error : ' + err);
                        }

                        res.should.have.status(409);

                        done();
                    });
            });
    });
});
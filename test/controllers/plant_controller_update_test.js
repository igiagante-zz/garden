/**
 * @author Ignacio Giagante, on 28/4/16.
 */

process.env.NODE_ENV = 'test';

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    mongoose = require("mongoose"),
    server = require('../../app/server'),
    Plant = require("../../app/models/plant"),
    sinon = require('sinon'),
    rewire = require('rewire'),
    Should = require('chai').Should(),
    fs = require('fs');

//var should = chai.should();
chai.use(chaiHttp);

describe('Plant Controller', function () {

    var plantId;
    var imageOneId;

    /**
     * It creates a plant with two images. Then, it updates the plant with new data. One new image (mango3) is added, while
     * other image (mango2) should be deleted because it isn't in the resourcesIds array.
     */
    it('should create one plant on /api/plant POST', function (done) {

        chai.request(server)
            .post('/api/plant')
            .field('name', 'mango_update')
            .field('phSoil', '123')
            .field('ecSoil', '123')
            .field('harvest', '123')
            .field('gardenId', '57164dd6962d5cca28000002')
            .field('size', '30')
            .attach('fileOne', fs.readFileSync(__dirname + '/images/mango1.jpg'), 'mango1.jpg')
            .attach('fileTwo', fs.readFileSync(__dirname + '/images/mango2.jpg'), 'mango2.jpg')

            .end(function (err, res) {

                if (err) {
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

                plantId = res.body._id;
                imageOneId = res.body.images[0]._id;

                done();
            });
    });

    it('should update one plant on /api/plant PUT', function (done) {

        var resourcesIds = [];
        resourcesIds.push(imageOneId);

        chai.request(server)
            .put('/api/plant/' + plantId)
            .field('name', 'mango_loco_updated')
            .field('phSoil', '123')
            .field('ecSoil', '123')
            .field('harvest', '123')
            .field('gardenId', '57164dd6962d5cca28000002')
            .field('size', '30')
            .field('resourcesIds', JSON.stringify(resourcesIds))
            .attach('fileTwo', fs.readFileSync(__dirname + '/images/mango3.jpg'), 'mango3.jpg')

            .end(function (err, res) {

                if (err) {
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
});
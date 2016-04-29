var expect = require('chai').expect;
var sinon = require('sinon');

var hashclient = require('../hashclient.js');
var config = require('./config.json');

var access_token = config.access_token;
var refresh_token = config.refresh_token;
var username = config.username;
var password = config.password;

describe("Authentication", function () {

    describe("No token parameters ", function () {
        it("should initialize empty authToken object", function (done) {
            var hashClient = new hashclient();
            expect(hashClient.authToken.access_token).to.equal(undefined);
            expect(hashClient.authToken.refresh_token).to.equal(undefined);
            done();
        });
    });

    describe("Missing refresh token ", function () {
        it("should initialize empty authToken object", function (done) {
            var hashClient = new hashclient(access_token);
            expect(hashClient.authToken.access_token).to.equal(undefined);
            expect(hashClient.authToken.refresh_token).to.equal(undefined);
            done();
        });
    });

    describe("Using token parameters ", function () {
        it("should initialize authToken object", function (done) {
            var hashClient = new hashclient(access_token, refresh_token);
            expect(hashClient.authToken.access_token).to.equal(access_token);
            expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
            done();
        });
    });

    describe("Using username and password ", function () {
        it("should return a valid authToken object", function (done) {
            var hashClient = new hashclient();
            hashClient.authenticate(username, password, function (err, result) {
                expect(result).to.have.property('access_token').and.to.be.a('string');
                expect(result).to.have.property('refresh_token').and.to.be.a('string');
                done();
            });
        });
    });

    describe("Using old access_token ", function () {
        it("should auto retrieve new access token using refresh token for POSTs", function (done) {
            var hashClient = new hashclient(access_token, refresh_token);
            expect(hashClient.authToken.access_token).to.equal(access_token);
            expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
            hashClient.submitHashItem('badhash', function (err, result) {
                expect(hashClient.authToken.access_token).to.not.equal(access_token);
                expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
                expect(err).to.have.property('error').and.to.equal('Parameter \'hash\' must be a valid SHA-256 hash.');
                done();
            });
        });
        it("should auto retrieve new access token using refresh token for GETs", function (done) {
            var hashClient = new hashclient(access_token, refresh_token);
            expect(hashClient.authToken.access_token).to.equal(access_token);
            expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
            hashClient.getBlockSubscription('badid', function (err, result) {
                expect(hashClient.authToken.access_token).to.not.equal(access_token);
                expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
                expect(err).to.have.property('error').and.to.equal('The request is invalid.');
                done();
            });
        });
        it("should auto retrieve new access token using refresh token for PUTs", function (done) {
            var hashClient = new hashclient(access_token, refresh_token);
            expect(hashClient.authToken.access_token).to.equal(access_token);
            expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
            hashClient.updateBlockSubscription('badid', 'badurl', function (err, result) {
                expect(hashClient.authToken.access_token).to.not.equal(access_token);
                expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
                expect(err).to.have.property('error').and.to.equal('The request is invalid.');
                done();
            });
        });
        var new_access_token;
        it("should auto retrieve new access token using refresh token for DELETEs", function (done) {
            var hashClient = new hashclient(access_token, refresh_token);
            expect(hashClient.authToken.access_token).to.equal(access_token);
            expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
            hashClient.deleteBlockSubscription('badid', function (err, result) {
                expect(hashClient.authToken.access_token).to.not.equal(access_token);
                expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
                expect(err).to.have.property('error').and.to.equal('The request is invalid.');
                new_access_token = hashClient.authToken.access_token;
                done();
            });
        });
        it("and the new access_token should continue to work", function (done) {
            var hashClient = new hashclient(new_access_token, refresh_token);
            expect(hashClient.authToken.access_token).to.equal(new_access_token);
            expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
            hashClient.deleteBlockSubscription('badid', function (err, result) {
                expect(hashClient.authToken.access_token).to.equal(new_access_token);
                expect(hashClient.authToken.refresh_token).to.equal(refresh_token);
                expect(err).to.have.property('error').and.to.equal('The request is invalid.');
                new_access_token = hashClient.authToken.access_token;
                done();
            });
        });
    });

});
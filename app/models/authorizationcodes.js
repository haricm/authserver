/**
 * Module dependencies.
 */
var mongodb = require('../../libs/mongodb')

exports.find = function (key, done) {
    mongodb.getCollection(function(collection) {
        var cursor = collection.find({token: key});
        cursor.nextObject(function(err, token) {
            if(!err && token) {
                return done(null, token);
            } else {
                return done(null);
            }
        });
    });
};

exports.save = function (code, clientID, redirectURI, userID, scope, done) {
    mongodb.getCollection(function (collection) {
        collection.insert({
            token: code,
            clientID: clientID,
            redirectURI: redirectURI,
            userID: userID,
            scope: scope
        }, function (err, inserted) {
            if (err) {
                return done(err);
            } else {
                return done(null);
            }
        });
    });
};

exports.delete = function(key, done) {
    mongodb.getCollection(function (collection) {
        collection.remove({
            token: key
        }, function (err, result) {
            if (err) {
                return done(err, result);
            } else {
                return done(null, result);
            }
        });
    });
};

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

exports.save = function (token, expirationDate, userID, clientID, scope, done) {
    mongodb.getCollection(function (collection) {
        collection.insert({
            token: token,
            userID: userID,
            expirationDate: expirationDate,
            clientID: clientID,
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

exports.delete = function (key, done) {
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

exports.cleanUpExpired = function (done) {
    mongodb.getCollection(function (collection) {
        collection.find().each(function (err, token) {
            if (token != null) {
                if (new Date() > token.expirationDate) {
                    collection.remove({
                        token: token
                    }, function (err, result) { });
                }
            }
        });
    });
    return done(null);
};

exports.removeAll = function(done) {
    mongodb.getCollection(function (collection) {
        collection.remove(function(err, result) {});
        return done(null);
    });
};

exports.findExpirationDate = function(expiresIn)	{
	return new Date(new Date().getTime() + (expiresIn * 1000));
}

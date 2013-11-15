/**
 * Module dependencies.
 */
var MongoClient = require('mongodb').MongoClient
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env]

/**
 * Our local static db
 */
var localDb;

/**
 * Gets the static collection of "storage" that is stored within mongo db
 * @param next Calls this when completed
 */
getCollection = function (next) {
    if (typeof localDb !== "undefined") {
        //The database is already initialized
        var localCollection = localDb.collection('storage');
        next(localCollection);
    } else {
        //We have to initialize the database and its connection
        MongoClient.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/'  + config.mongo.dbName, function (err, db) {
            if (err) {
                throw err;
            }
            localDb = db;
            //Add an index to the tokens
            localDb.collection('storage').ensureIndex({token: 1}, function(err, inserted) {});
            getCollection(next);
        });
    }
};

exports.getCollection = getCollection;

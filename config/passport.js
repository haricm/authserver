/**
 * Module dependencies.
 */
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , BasicStrategy = require('passport-http').BasicStrategy
    , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
    , BearerStrategy = require('passport-http-bearer').Strategy
    , env = process.env.NODE_ENV || 'development'
    , config = require('./config')[env]
    , db = require('../app/models');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
    function (username, password, done) {
	          db.user.findOne( {username : username}, function (err, user) { 

            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
			if (!user.authenticate(password)) {  
                return done(null, false);
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	db.user.findOne( {_id : id}, function (err, user) { 
        done(err, user);
    });
});

/**
 * 
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(
    function (username, password, done) {
        db.clients.findByClientId(username, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.clientSecret != password) {
                return done(null, false);
            }
            return done(null, client);
        });
    }
));

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
passport.use(new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        db.clients.findByClientId(clientId, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.clientSecret != clientSecret) {
                return done(null, false);
            }
            return done(null, client);
        });
    }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
    function (accessToken, done) {
        db.accessTokens.find(accessToken, function (err, token) {
            if (err) {
                return done(err);
            }
            if (!token) {
                return done(null, false);
            }
            if(new Date() > token.expirationDate) {
                db.accessTokens.delete(accessToken, function(err) {
                    return done(err);
                });
            } else {
                if (token.userID != null) {
    			    db.user.findOne( {_id : token.userID}, function (err, user) { 
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, false);
                        }
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = { scope: '*' };
                        return done(null, user, info);
                    });
                } else {
                    //The request came from a client only since userID is null
                    //therefore the client is passed back instead of a user
                    db.clients.find(token.clientID, function (err, client) {
                        if (err) {
                            return done(err);
                        }
                        if (!client) {
                            return done(null, false);
                        }
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = { scope: '*' };
                        return done(null, client, info);
                    });
                }
            }
        });
    }
));





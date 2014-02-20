/**
 * Module dependencies.
 */
var env = process.env.NODE_ENV || 'development'
    , config = require('./config/config')[env]
    , mongoose = require('mongoose')
    , passport = require('passport')
    , oauth2 = require('./app/controllers/api/oauth2')
    , user = require('./app/controllers/api/user')
    , client = require('./app/controllers/api/client')
    , token = require('./app/controllers/api/token')
    , site = require('./app/controllers/site')
    , express = require('express')
    , fs = require('fs')
    , https = require('https')
    , db = require('./app/models')
    , flash = require('connect-flash'); 
    
// Connect to MongoDB 
mongoose.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.dbName);

// Session Configuration
var ConnectMongo = require('connect-mongo')(express);
var sessionStore = new ConnectMongo({
     db: config.mongo.dbName                                   
});

// Express configuration
var app = express();
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({                              
    secret: config.session.secret,                    
    store: sessionStore,                              
    key: "auth.sid",                         
    cookie: {maxAge: config.session.maxAge }          
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(function(err, req, res, next) {                
    if(err) {                                          
        res.status(err.status);                        
        res.json(err);
    } else {
        next();
    }
});

require('./config/passport');                           // Passport configuration

app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);
app.get('/activate', site.activate);
app.get('/resetpassword', site.resetPasswordForm);
app.post('/resetpassword', site.resetPassword);
app.get('/changepassword', site.changePasswordForm);
app.post('/changepassword', site.changePassword);
app.get('/signup', site.signUpForm);
app.post('/signup', site.signUp);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);
app.get('/oauth/tokeninfo', oauth2.tokeninfo);

app.get('/api/userinfo', user.info);
app.get('/api/clientinfo', client.info);


//Self-Signed Certificates
var privatekey = fs.readFileSync('certs/privatekey.pem');
var certificate = fs.readFileSync('certs/certificate.pem');

var port = process.env.PORT || 8000 ;            
https.createServer({ key : privatekey , cert : certificate }, app).listen(port);
console.log("AuthServer started on port 8000");

setInterval(function () {                               
    db.accessTokens.cleanUpExpired(function(err) {               
        if(err) {
            console.error("Error while cleaning up expired tokens");
        }
    });
}, config.token.expiresIn * 1000);

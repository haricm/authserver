/**
 * Module dependencies.
 */
var mailclient = require('../../libs/mailclient')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , url = require('url')
  , User = require('../models/user')
  , passport = require('passport')
  , login = require('connect-ensure-login')
  , utils = require('../../libs/utils')
  , UserClaim = require('../models/userclaim')
  , User = require('../models/user');

/**
 * GET https://localhost:8000/
 *
 */
exports.index = function (req, res) {
	if(req.isAuthenticated())
	{
		res.render('home', { title : config.site.title, user: req.user });
	} else {
		res.redirect('/login');
	}
};
/**
 * GET https://localhost:8000/login/
 *
 */
exports.loginForm = function (req, res) {
	if(req.isAuthenticated())
	{
		res.redirect('/');
	} else {
		res.render('login', { title : config.site.title } );
	} 
};
/**
 * POST https://localhost:8000/login/
 *
 */
exports.login = [
    passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect: '/login', failureFlash: true })
];
/**
 * GET https://localhost:8000/activate/?md5=MD5SUM&secret=VERIFICATIONCODE
 *
 */
exports.activate = function (req, res) {
	var url_parts = url.parse(req.url,true);
	UserClaim.findOne( { md5sum : url_parts.query.md5 }, function (err, userclaims) { 
        if (err) {
            return done(err);
        }
        if (!userclaims) {
            return done(null, false);
        }
	    if (!userclaims.activate(url_parts.query.secret)) { 
            return done(null, false);
        }
        User.update({_id : userclaims.userid}, {userStatus : 1} , function(err, numberAffected, rawResponse) {
			if(numberAffected===0)	{
				console.log("Updating User failed");
			} else
			{
				userclaims.remove();
			}
		})
    });
    req.redirect('/logout');
};
/**
 * GET https://localhost:8000/resetpassword
 *
 */
exports.resetPasswordForm = function (req, res)	{
	res.render('resetpassword', { title : config.site.title } );
};
/**
 * POST https://localhost:8000/resetpassword
 *
 */
exports.resetPassword = function (req, res)	{
	var newpassword = utils.uid(8);
	User.findOne({email : req.body.email}).exec(function (err, user) {
		if(err )	{
			req.redirect('/resetpassword');
		} else if(!user)   {
			req.redirect('/resetpassword');
	    }  else  {
		   user.password = newpassword;
		   user.save(function(err)	{
			   if(err)
			       console.log(err)
			   else
			   {
				  mailclient.sendPasswordResetEmail(user.fullName, user.email, user.username, newpassword);
			   }
			   
		   });
		}
	})
	res.redirect('/login');
};
/**
 * GET https://localhost:8000/changepassword
 *
 */
exports.changePasswordForm = function (req, res)	{
	res.render('changepassword', { title : config.site.title, user: req.user  } );
};
/**
 * POST https://localhost:8000/changepassword
 *
 */
exports.changePassword = function (req, res) { //req.user.username
	if(!req.isAuthenticated())
	{
		res.redirect('/login');
	} else {
        User.findOne({ username: req.user.username }).exec(function (err, user) {
			if(err )	{
				req.redirect('/changepassword');
		    } 
			if(user.authenticate(req.body.password))	{
				user.password = req.body.password1;
				user.save(function(err)	{
					if(err)
						console.log(err)
					else
					{
						console.log("Database updated");
					}
				});
			}
		})
	}
	res.redirect('/account');
};
/**
 * GET https://localhost:8000/signup
 *
 */
exports.signUpForm = function (req, res) {
    res.render('signup',  { title : config.site.title, flasherror : req.flash('flash-error') });
};
/**
 * POST https://localhost:8000/signup
 *
 */
exports.signUp = function (req, res) {
    var newuser= new User({ fullName : req.body.fullName, email : req.body.email, username : req.body.username, password : req.body.password });
    newuser.save(function (err) { 
    if (err) {	
	    if(err.name === 'ValidationError')
		{
		    //var errorMsg = "<div class=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + err.errors[Object.keys(err.errors)[0]].type + "</div>";
			var errorMsg = "Error";
			//res.render('signup', { title : config.site.title, error : errorMessage });
			req.flash('flash-error', errorMsg)
			res.redirect('/signup');
		}
		else 
		{
			console.log('Unknown Error while inserting User');
			res.render('signup', { title : config.site.title, error : '' });
		    console.log(err);
		}
    }  else  {
        var newuserclaim= new UserClaim({ fullName : newuser.fullName, email : newuser.email, userid : newuser._id });
		newuserclaim.save(function (err) { 
		if (err) {
		    if(err.name === 'ValidationError')
			{
				console.log(err);
			}  else   {
				console.log(err);
			}
		}
		});
    }	 
	});
    res.redirect('/login');
};
/**
 * GET https://localhost:8000/logout
 *
 */
exports.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};
/**
 * GET https://localhost:8000/account
 *
 */
exports.account = [
    login.ensureLoggedIn(),
    function (req, res) {
        res.render('account', { title : config.site.title, user: req.user });
    }
];

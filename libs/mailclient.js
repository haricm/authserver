var env = process.env.NODE_ENV || 'development'
    , config = require('../config/config')[env]
    , ejs = require('ejs')
    , nodemailer = require('nodemailer')
//    , fs = require('fs')
//    , str = fs.readFileSync(__dirname + '../app/views/emailverify.ejs', 'utf8');


var sendEmailVerifyLink = function(fullName, email, md5sum, verificationCode)	{
	    var str =  "<!DOCTYPE html><p> Hello <%= fullName %> , </p><p>	Welcome to <%- site.title %>! Before you can use your account you will need to activate it by visiting the following URL: </p><p><a href=\"https://<%- site.host %>:<%- site.port %>/activate/?md5=<%- md5sum %>&secret=<%- verificationCode %>\">https://<%- site.host %>:<%- site.port %>/activate/?md5=<%- md5sum %>&secret=<%- verificationCode %></a> </p><p> If you did not sign up, you may safely ignore this email. </p>";
		// Create a SMTP transport object
		var transport = nodemailer.createTransport("SMTP", {
				service: 'Sendgrid', // use well known service.
									// If you are using @gmail.com address, then you don't
									// even have to define the service name
				auth: {
					user: config.mail.username,
					pass: config.mail.password
				}
		});

		console.log('SMTP Configured');
		
		var message = {
		from: config.mail.defaultMailSender,
		to: email,
		subject: 'Confirm your email address', //
		headers: {
			'X-Laziness-level': 1000
		},
		// plaintext body
		text: 'Blah Blah!',
		html : ejs.render(str, {site : config.site ,fullName : fullName , md5sum : md5sum, verificationCode : verificationCode  })
	};
	
	console.log('Sending Mail');
	transport.sendMail(message, function(error){
		if(error){
			console.log('Error occured');
			console.log(error.message);
			return;
		}
		console.log('Message sent successfully!');

		// if you don't want to use this transport object anymore, uncomment following line
		//transport.close(); // close the connection pool
	});
}
var sendPasswordResetEmail = function(fullName, email, username, newpassword)	{

var str =  "<!DOCTYPE html><p> Hello <%= fullName %> , </p><p>	Your password for <%- site.title %> has been reset to: </p><p><%- newpassword %></p><p>You may login with your new password at the <a href=\"https://<%- site.host %>:<%- site.port %>/login\">login page</a>.</p><p>Please remember to reset it to something personal from the <a href=\"https://<%- site.host %>:<%- site.port %>/changepassword\">change password page</a>.</p>";
		var transport = nodemailer.createTransport("SMTP", {
				service: 'Sendgrid', 
				
				auth: {
					user: config.mail.username,
					pass: config.mail.password
				}
		});

		console.log('SMTP Configured');
		
		var message = {
		from: config.mail.defaultMailSender,
		to: email,
		subject: 'VoteForChange Account Password Reset', //
		headers: {
			'X-Laziness-level': 1000
		},

		text: 'Blah Blah!',
		html : ejs.render(str, {site : config.site ,fullName : fullName ,username : username, newpassword : newpassword  })
	};
	
	console.log('Sending Mail');
	transport.sendMail(message, function(error){
		if(error){
			console.log('Error occured');
			console.log(error.message);
			return;
		}
		console.log('Message sent successfully!');
	});

}


module.exports.sendEmailVerifyLink = sendEmailVerifyLink;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;

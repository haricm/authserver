/**
 * Module dependencies.
 */
var path = require('path')

var rootPath = path.resolve(__dirname + '../..')

/**
 * Expose config
 */

module.exports = {
  development: {
	  
   /**
	* Mongo Configuration 
	*
	* 
	*/
	mongo :	{
		host : '127.0.0.1',
		port :  '27017',
		dbName : 'your db name'
	},

   /**
	* Website Configuration 
	*
	* TODO : Remove url
	*/
	site :	{
		title : 'Title',
		host  : 'localhost'	,
		port  : '8000'
	},

   /**
	* Mail Configuration 
	* 
	* authserver supports only sendgrid. If you want to use another provider, feel free to edit mailclient.js
	* 
	* Set defaultMailSender, username and password to appropriate values
	*/
    mail :	{
		defaultMailSender : 'donotreply <no-reply@my-domain.com>',
		username : 'your username',
		password : 'your password'
	},
    
   /**
	* Access token Configuration 
	*
	*/
    token : {
		expiresIn: 3600,
		authCodeLength: 16,
		accessTokenLength: 256,
		refreshTokenLength: 256
	},
	
    /**
    * Session configuration
	*
	* secret :- Set secret to some value
	*/
    session : {
		dbName: "Session",
		secret: "top-secret change this", 
		maxAge: 1000 * 3600 * 24 * 7 * 100
		                            
		
	}
	
  },
  test: {

  },
  staging: {

  },
  production: {

  }
}

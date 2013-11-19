authserver
==========

An Authorization Server 

Test Deployment
===============

Here is how you make a test deployment:

 ```
$ git clone https://github.com/haricm/authserver.git 
$ cd authserver
$ mkdir data
$ mkdir data/db
$ mongod --dbpath data/db
Open new console tab
$ cp config/config-sample.js config/config.js
Open config/config.js      // Customize this file as needed
$ mkdir certs
$ openssl genrsa -out certs/privatekey.pem 1024
$ openssl req -new -key certs/privatekey.pem -out certs/certrequest.csr
$ openssl x509 -req -in certs/certrequest.csr -signkey certs/privatekey.pem -out certs/certificate.pem
$ npm install
$ node app.js
 ```

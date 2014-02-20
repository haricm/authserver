var env = process.env.NODE_ENV || 'development'
    , config = require('../../config/config')[env]
 
var clients = config.clients;
/*    
var clients = [
    {
        id: '1',
        name: 'Samplr',
        clientId: 'abc123',
        clientSecret: 'ssh-secret'
    },
    {
        id: '2',
        name: 'Samplr2',
        clientId: 'xyz123',
        clientSecret: 'ssh-password'
    },
    {
        id: '3',
        name: 'Samplr3',
        clientId: 'pqr123',
        clientSecret: 'ssh-password1',
        trustedClient: true
    }
];
*/

exports.find = function(id, done) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.id === id) {
      return done(null, client);
    }
  }
  return done(null, null);
};

exports.findByClientId = function(clientId, done) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.clientId === clientId) {
      return done(null, client);
    }
  }
  return done(null, null);
};

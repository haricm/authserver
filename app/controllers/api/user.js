/**
 * Module dependencies.
 */
var passport = require('passport');

/**
 * GET https://localhost:8000/api/userinfo
 *
 */
exports.info = [
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
  	console.log("token info inside")
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    res.json({ user_id: req.user.id, name: req.user.fullName, scope: req.authInfo.scope })
  }
];

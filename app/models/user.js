/**
 * Module Dependencies
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , UserClaim = require('./userclaim')

/**
 * User Schema 
 */
  var UserSchema = new Schema({
  userStatus : { type : Number, default: 0 },
  fullName: { type: String, default: '' },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
  authToken: { type: String, default: '' },

})

/**
 * Virtuals
 */

 UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password }) 

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

UserSchema.path('fullName').validate(function (name) {
  return name.length
}, 'Name cannot be blank')

UserSchema.path('email').validate(function (email) {
  return email.length
}, 'Email cannot be blank')

/**
 *  Passing a validator function that receives two arguments tells mongoose that the validator is an asynchronous validator. 
 *  The first argument passed to the validator function is the value being validated. The second argument is a callback 
 *  function that must called when you finish validating the value and passed either true or false to communicate either 
 *  success or failure respectively.
 * 
 *  schema.path('name').validate(function (value, respond) {
 *  doStuff(value, function () {
 *    ...
 *    respond(false); // validation failed
 *  })
 *  }, '{PATH} failed validation.');
 * 
 */
 
UserSchema.path('email').validate(function (email, fn) {
  var User = mongoose.model('User')

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
    User.find({ email: email }).exec(function (err, users) {
      fn(!err && users.length === 0)
    })
  } else fn(true)
}, 'Email already exists')

UserSchema.path('username').validate(function (username) {
  return username.length
}, 'Username cannot be blank')

UserSchema.path('hashed_password').validate(function (hashed_password) {
  return hashed_password.length
}, 'Password cannot be blank')


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.password) === -1)
    next(new Error('Invalid password'))
  else
    next()
})

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
	if(this.userStatus === 0) return false
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  }
}

module.exports = mongoose.model('User', UserSchema);

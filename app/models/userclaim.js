/**
 * Module Dependencies
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , utils = require('../../libs/utils')
  , mailclient = require('../../libs/mailclient')



/**
 * UserClaim Schema 
 */
  var UserClaimSchema = new Schema({
  userid:  {type : Schema.ObjectId, ref : 'User'},
  fullName: { type: String, default: '' },
  //email: { type: String, default: '' },
  md5sum : { type: String, default: '' },
  verificationCode : { type: String, default: '' },
  //mobileNumber : { type: String, default: '' },
  //pin : { type: String, default: '' }

})

/**
 * Virtuals
 */

/**
 * var crypto = require("crypto");
 * var md5sum = crypto.createHash('md5').update(email).digest('hex');
 * var secret = 
 * 
 */ 
 
 UserClaimSchema
  .virtual('email')
  .set(function(email) {
    this._email = email
    this.verificationCode = utils.uid(44)
    this.md5sum = this.encodeEmail(email)
  })
  .get(function() { return this._email }) 

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

//UserClaimSchema.path('userid').validate(function (userid) {
//  return userid.length
//}, 'Userid cannot be blank')

/**
 * Pre-save hook
 */

UserClaimSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.md5sum) === -1)
    next(new Error('Invalid md5sum'))
  if (!validatePresenceOf(this.confirmationCode) === -1)
    next(new Error('Invalid confirmationCode'))
  else
    next()
})

UserClaimSchema.post('save', function (doc) {
  console.log('UserClaim Document Saved');
  doc.sendActivationMail();
  console.log('Sending Activation Mail');
})

UserClaimSchema.methods = {

  /**
   * Activate - check if the md5sum and verficationCode are same
   *
   * @param {String} email
   * @param {String} secret
   * @return {Boolean}
   * @api public
   */

  activate: function (secret) {
    return secret === this.verificationCode	
  },


  sendActivationMail: function ()	{
	  mailclient.sendEmailVerifyLink(this.fullName ,this.email,this.md5sum, this.verificationCode );

  },

  /**
   * Encode Email
   *
   * @param {String} email
   * @return {String}
   * @api public
   */

  encodeEmail : function (email) {
    if (!email) return ''
    var md5sum
    try {
      md5sum = crypto.createHash("md5").update(email).digest("hex");
      return md5sum
    } catch (err) {
      return ''
    }
  }
  

}

module.exports = mongoose.model('UserClaim', UserClaimSchema);

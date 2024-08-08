const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    maxlength: 12,
    minlength: 5
  },
  email: {
    type: String,
    unique: true,
    required: true
  }, 
  password: {
    type: String, 
    required: true,
  },
  verificationCode: {
    type: String
  },
  verified: {
    type: Boolean, 
    default: false
  },
  profilePic: {
    type: String,
  }
})

module.exports = mongoose.model('User', UserSchema)
var mongoose = require('mongoose')


var UserBehaviorSchema = new mongoose.Schema({
  user_email: String,
  os: String,
  browser: {
    name: String,
    version: String
  },
  deviceType: String,
  screenSize: {
    width: Number,
    height: Number,
  },
  ip: String,
  latitude: String,
  longitude: String,
  page: String,
  accessed_at : { type: Date, default: Date.now }
});


module.exports = mongoose.model('UserBehavior', UserBehaviorSchema);
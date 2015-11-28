var mongoose = require('mongoose')
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    //select: false // hide for query results
  },
  role : {
    type: String,
    default: "regular"
  },
  description: {
    type: String,
    maxLength: [500],
  },
  display_name: {
    type: String
  },
  profile_image: {
    type: String,
  }
});

// before saving, let's hash the password
UserSchema.pre('save', function (next){
  var user = this;

  mongoose.model('User', UserSchema).count(function (err, count){
    if (err) next(err);

    // if it's the first user, make him an admin
    if (count <= 0) this.role = "super-admin";

    // if the password wasn't modified
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function (err, salt){
      if (err) return next(err);

      // save the hashed password
      bcrypt.hash(user.password, salt, function (err, hash){
        user.password = hash; // user.password also contains the salt
        next();
      });
    });

  });

});


UserSchema.methods.comparePassword = function(candidatePassword, callback){
  bcrypt.compare(candidatePassword, this.password, function (err, isEqual){
    if (err) return callback(err);

    callback(null, isEqual);
  })
};



module.exports = mongoose.model('User', UserSchema);

// Types of UserSchema
// regular
// admin
// super-admin
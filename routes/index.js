var express = require('express');
var router = express.Router();
var User = require('../models/user');
var UserBehavior = require('../models/userBehavior');
var requestIp = require('request-ip');


router.route('/usersBehaviors')
  // save meta information about the current user
  .post(function (req, res){
    var ub = new UserBehavior();
    
    ub.user_email = req.body.user_email;
    ub.os = req.body.os;
    ub.browser = req.body.browser;
    ub.deviceType = req.body.deviceType;
    ub.screenSize = req.body.screenSize;
    ub.latitude = req.body.latitude;
    ub.longitude = req.body.longitude; 
    ub.ip = requestIp.getClientIp(req);
    ub.page = req.body.page;


    ub.save(function (err){
      if (err) return res.status(400).send(err);
      return res.json(ub);
    });

  })
  // access this information sorted by most recent
  .get(function (req, res){
    UserBehavior.find({}).sort('-accessed_at').find(function (err, ub){
      if (err) return res.status(400).send(err);
      return res.json(ub);  
    });
    
  });


// get some interesting user behaviors, such as most viewed page
// and most frequent user
router.route('/interestingUsersBehaviors')
  .get(function (req, res){
    UserBehavior.aggregate([{"$group" : { "_id": "$page", count: {$sum : 1 }}}, {"$sort": { count: -1 }}, { "$limit" : 1}])
      .exec(function (err, result){
        if (err) return res.status(400).send(err);

        UserBehavior.aggregate([{"$group" : { _id: "$user_email", count: {$sum : 1 }}}, {"$sort": { count: -1 }}, { "$limit" : 1}])
          .exec(function (err, result2){
            var realResult = {
              "mostViewedPage" : {
                "page" : result[0]["_id"],
                "accesses": result[0].count
              },
              "mostFrequentUser" : {
                "user" : result2[0]["_id"],
                "accesses" : result2[0].count
              }
            };
            return res.json(realResult);
          });
    });
    

  });

router.route('/users')
  // get all users
  .get(function(req, res){
    var query = User.find();
    query.select('-password'); //hide the password field
    query.exec(function(err, users){
      if (err) return res.status(400).send(err);
      res.json(users);
    });
  })

  .post(function(req, res){
    var user = new User();
    user.email = req.body.email;
    user.password = req.body.password;

    // the first user is the super-admin
    User.count({}, function (err, count){
      if (count <= 0) user.role = "super-admin";

      user.save(function (err){
      if (err) return res.json(err);
        res.json(user);
      });

    });
    

  });

router.route('/users/:user_email')
  .get(function (req, res){
    var query = User.findOne({ email: req.params.user_email});
    query.select('-password'); // hide the password field
    query.exec(function (err, user){
      if (err) res.status(400).send(err);

      res.json(user);
    });
  })
  .put(function(req, res){
    User.findOne({ email: req.params.user_email}, function (err, user){
      if (err) return res.status(400).send(err);

      // updates the information about the user
      // actually it just replaces all the info 
      user.password = req.body.password || user.password;
      user.description = req.body.description;
      user.role = req.body.role;
      user.display_name = req.body.display_name;
      user.profile_image = req.body.profile_image;
      

      user.save(function(err){
        if (err) return res.send(err);

        // creates a copy of user, remove the password field
        // and returns it
        var u = JSON.parse(JSON.stringify(user));
        delete u['password'];
        res.json(u);
      });
    });
  })
  .delete(function(req, res){
    User.remove({ email: req.params.user_email }, function (err, user){
      if (err) return res.status(400).send(err);

      res.json({ message: 'User deleted' });
    });
  });

  router.route('/login')
    .post(function (req, res){
      User.findOne({ email: req.body.username }, function (err, user){
        if (err) return res.status(400).send(err);

        // if the user isn't registered
        if (!user) return res.status(401).send({ err: "User invalid. "});

        user.comparePassword(req.body.password, function (err, isEqual){
          if (!isEqual) return res.status(401).send({err : "Password/email invalid."});

          return res.status(200).send({ status: "Successful login.", user : user});
        });
      });

    });

module.exports = router;

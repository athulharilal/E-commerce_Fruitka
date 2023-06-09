// require('dotenv').config();
const db = require("../config/connection");
const collection = require("../config/collection");
const ObjectId = require('mongodb').ObjectId;



module.exports = {
  admin: (req, res, next) => {
    if (req.session.adminLoggedIn) {
      next();
    } else {
      res.render("admin/adminlogin", {
        admin: true,
        loginErr: req.session.loginErr,
      });
    }
    req.session.loginErr = false;
  },
  user: (req, res, next) => {
    if (req.session.loggedIn) {
      next();
    } else {
      res.render('user/login');
    }
  },
  loginUserCheck: async (req, res, next) => {
    try {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({
        Email: req.body.Email
      });

      if (user && !user.isBlocked) {
        next();
      } else {
        res.render('user/login', {
          blocked: true
        });
      }
    } catch (error) {
      console.log(error);
      res.redirect('/login');
    }
  },
  userCheck: async (req, res, next) => {
    if (req.session.user && req.session.user._id) {
      try {
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({
          _id: ObjectId(req.session.user._id)
        });

        if (user && !user.isBlocked) {
          next();
        } else {
          res.render('user/login', {
            blocked: true
          });
        }
      } catch (error) {
        console.log(error);
        res.render('error', {
          message: 'An error occurred during user validation.'
        });
      }
    } else {
      res.redirect('/login');
    }
  },

};

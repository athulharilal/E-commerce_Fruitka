require('dotenv').config();
const db = require("../config/connection");
const collection = require("../config/collection");
const ObjectId = require('mongodb').ObjectId;


const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser(function (user, done) {
    // Store the user ID in the session
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({
            _id: ObjectId(id)
        });
        done(null, user); // Pass the user object to the done callback
    } catch (error) {
        done(error, null); // Pass the error to the done callback
    }
});



passport.use(new GoogleStrategy({
    clientID: process.env.GOOOGLE_ClIENT_ID,
    clientSecret: process.env.GOOOGLE_ClIENT_SECRET,
    callbackURL: process.env.GOOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null, profile);
}));

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
    }
};
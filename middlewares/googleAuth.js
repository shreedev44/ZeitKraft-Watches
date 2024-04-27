const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
require('dotenv').config({path: './variables.env'});

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {

        if (accessToken === undefined) {
            return done(new Error("Access token is undefined"));
          }

        return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
    done(null, JSON.stringify(user));
  });
  
  passport.deserializeUser((user, done) => {
    try {
      done(null, JSON.parse(user));
    } catch (error) {
      done(error, null);
    }
  });
  
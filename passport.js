const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
    
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: "6878890882-4a764qvl54hib21i2oeha571nq5k2b6p.apps.googleusercontent.com",
    clientSecret: "ovH5w1bNL5_iBDY5xaNXJFQ6",
    callbackURL: "http://localhost:5000/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
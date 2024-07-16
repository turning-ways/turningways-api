const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserService = require("./services/user.service");
const User = require("./model/userModel");
const AppError = require("./utils/appError");

// TODO: Add A Google Authentication Strategy
passport.use(
  "admin-google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/v1/auth/google/admin/callback",
      // passReqToCallback: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        const currentUser = await UserService.findUserByProviderId(profile.id);
        if (currentUser) {
          return done(null, currentUser);
        }

        // check if the email already exists
        const emailExist = await User.findOne({
          email: profile.emails[0].value,
        });
        console.log(emailExist);
        if (emailExist) {
          emailExist.externalProvider.provider.id = profile.id;
          emailExist.externalProvider.provider.name = "google";
          emailExist.externalProvider.provider.email = profile.emails[0].value;
          await emailExist.save({ validateBeforeSave: false });
          return done(null, emailExist);
        }

        // If the user is not found, create a new user
        const newUser = await UserService.createUserByPhone({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          emailConfirmed: true,
          externalProvider: {
            provider: {
              name: "google",
              id: profile.id,
              email: profile.emails[0].value,
            },
          },
          photo: profile.photos[0].value,
          role: "admin",
        });

        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done(error, null);
      }
    },
  ),
);

// Serialize the user so that the user can be stored in the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize the user from the session so that the user can be used in the request
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;

const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const env = require("./env");
const User = require("../models/user.model");
const AuthProvider = require("../models/auth-provider.model");

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account email is required"));
          }

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: profile.displayName || email.split("@")[0],
              email,
              googleId: profile.id,
              profileImage: profile?.photos?.[0]?.value || "",
              isEmailVerified: true,
            });
          } else {
            user.googleId = profile.id;
            if (!user.profileImage && profile?.photos?.[0]?.value) {
              user.profileImage = profile.photos[0].value;
            }
            await user.save();
          }

          await AuthProvider.findOneAndUpdate(
            { provider: "google", providerId: profile.id },
            { user: user._id, email, providerData: profile._json || {} },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;

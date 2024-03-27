const User = require('../models/User');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

exports.jwtStrategy = new JwtStrategy(options, async (payload, done) => {
  const match = await User.findOne({ _id: payload.id }).lean().exec();
  if (match) {
    return done(null, true);
  }
  return done(null, false);
});

import { ExtractJwt, Strategy } from 'passport-jwt';
import env from '../utils/env';
import passport from 'passport';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: env.JWT_SECRET,
};

const jwtAuth = new Strategy(jwtOptions, (payload, done) => {
  if (payload.sub === env.USER) done(null, true);
  else done(null, false);
});


passport.use(jwtAuth);

export default passport.authenticate('jwt', { session: false });
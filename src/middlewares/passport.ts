import passport from 'passport';
import UserModel, { UserDocument } from '../database/models/user.model';
import { setupJwtStrategy } from '../common/strategies/jwt.strategy';
import { setupGoogleStrategy } from '../common/strategies/google.strategy';
import { AppError } from '../common/utils/AppError';
const intializePassport = () => {
    setupJwtStrategy(passport);
    setupGoogleStrategy(passport);
    // Serialize user vào session
    passport.serializeUser((data: any, done) => {
        if (!data.user || !data.user._id) {
            return done(new AppError('User object is invalid or missing _id'));
        }
        done(null, data.user._id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                return done(null, false);
            }
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

intializePassport();
export default passport;

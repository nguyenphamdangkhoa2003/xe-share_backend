import { Router } from 'express';
import { authController } from './auth.module';
import { authenticateJWT } from '../../common/strategies/jwt.strategy';
import passport from 'passport';

const authRoutes = Router();

authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.post('/verify/email', authController.verifyEmail);
authRoutes.post('/password/forgot', authController.forgotPassword);
authRoutes.post('/password/reset', authController.resetPassword);
authRoutes.post('/logout', authenticateJWT, authController.logout);

authRoutes.get('/refresh', authController.refreshToken);

authRoutes.get(
    '/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

authRoutes.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
    }),
    authController.handleGoogleCallback
);
export default authRoutes;

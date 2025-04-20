import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import morgan from 'morgan';
import { authenticateJWT } from './common/strategies/jwt.strategy';
import { config } from './config/app.config';
import { HTTPSTATUS } from './config/http.config';
import connectDatabase from './database/database';
import { asyncHandler } from './middlewares/asyncHandler';
import { errorHandler } from './middlewares/errorHandler';
import passport from './middlewares/passport';
import authRoutes from './modules/auth/auth.routes';
import mfaRoutes from './modules/mfa/mfa.routes';
import sessionRoutes from './modules/session/session.routes';
import { userRoutes } from './modules/user/user.routes';
import { chatRoute } from './modules/chat/chat.route';
import directionRoutes from './modules/trip/trip.routes';
import { websiteRouter } from './modules/website/website.route';
const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: config.APP_ORIGIN,
        credentials: true,
    })
);
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
);
app.use(
    session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.get(
    '/',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        res.status(HTTPSTATUS.OK).json({
            message: 'Hello Subscribers!!!',
        });
    })
);

app.use(`${BASE_PATH}/auth`, authRoutes);

app.use(`${BASE_PATH}/mfa`, mfaRoutes);

app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);

app.use(`${BASE_PATH}/users`, userRoutes);

app.use(`${BASE_PATH}/chat`, chatRoute);

app.use(`${BASE_PATH}/trip`, directionRoutes);

app.use(`${BASE_PATH}/website-setting`, websiteRouter);

app.use(errorHandler);

app.listen(config.PORT, async () => {
    console.log(
        `Server listening on port ${config.PORT} in ${config.NODE_ENV}`
    );
    await connectDatabase();
});

import 'dotenv/config';
import cors from 'cors';
import session from 'express-session';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/app.config';
import connectDatabase from './database/database';
import { errorHandler } from './middlewares/errorHandler';
import { HTTPSTATUS } from './config/http.config';
import { asyncHandler } from './middlewares/asyncHandler';
import authRoutes from './modules/auth/auth.routes';
import passport from './middlewares/passport';
import sessionRoutes from './modules/session/session.routes';
import { authenticateJWT } from './common/strategies/jwt.strategy';
import mfaRoutes from './modules/mfa/mfa.routes';
import { userRoutes } from './modules/user/user.routes';

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

app.use(errorHandler);

app.listen(config.PORT, async () => {
    console.log(
        `Server listening on port ${config.PORT} in ${config.NODE_ENV}`
    );
    await connectDatabase();
});

import { getEnv } from '../common/utils/get-env';

const appConfig = () => ({
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    APP_ORIGIN: getEnv('APP_ORIGIN', 'localhost'),
    APP_URL: getEnv('APP_URL'),
    PORT: getEnv('PORT', '5000'),
    BASE_PATH: getEnv('BASE_PATH', '/api/v1'),
    MONGO_URI: getEnv('MONGO_URI'),
    JWT: {
        SECRET: getEnv('JWT_SECRET'),
        EXPIRES_IN: '15m' as const,
        REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
        REFRESH_EXPIRES_IN: '30d' as const,
    },
    MAILER_SENDER: getEnv('MAILER_SENDER'),
    GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),
    NODEMAILER_HOST: getEnv('NODEMAILER_HOST'),
    NODEMAILER_PORT: getEnv('NODEMAILER_PORT'),
    NODEMAILER_USER: getEnv('NODEMAILER_USER'),
    NODEMAILER_PASSWORD: getEnv('NODEMAILER_PASSWORD'),
});

export const config = appConfig();

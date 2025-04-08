import { getEnv } from '../common/utils/get-env';

const appConfig = () => ({
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    APP_ORIGIN: getEnv('APP_ORIGIN', 'localhost'),
    PORT: getEnv('PORT', '5000'),
    BASE_PATH: getEnv('BASE_PATH', '/api/v1'),
    MONGO_URI: getEnv('MONGO_URI'),
    MAILER_SENDER: getEnv('MAILER_SENDER'),
    RESEND_API_KEY: getEnv('RESEND_API_KEY'),
});

export const config = appConfig();

import { CookieOptions, Response } from 'express';
import { config } from '../../config/app.config';
import { calculateExpirationDate } from './date-time';

type CookiePayloadType = {
    res: Response;
    accessToken: string;
    refreshToken: string;
};

export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
    httpOnly: true, // Mặc định là true cho bảo mật
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.JWT.REFRESH_EXPIRES_IN;
    const expires = calculateExpirationDate(expiresIn);
    return {
        ...defaults,
        expires,
        path: REFRESH_PATH,
        httpOnly: true, // Đảm bảo refreshToken luôn httpOnly
    };
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.JWT.EXPIRES_IN;
    const expires = calculateExpirationDate(expiresIn);
    return {
        ...defaults,
        expires,
        path: '/',
        httpOnly: false, // Cho phép JS đọc accessToken
    };
};

export const setAuthenticationCookies = ({
    res,
    accessToken,
    refreshToken,
}: CookiePayloadType): Response =>
    res
        .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
        .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

export const clearAuthenticationCookies = (res: Response): Response =>
    res
        .clearCookie('accessToken', getAccessTokenCookieOptions())
        .clearCookie('refreshToken', getRefreshTokenCookieOptions());

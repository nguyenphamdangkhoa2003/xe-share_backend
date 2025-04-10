import {
    Strategy as GoogleStrategy,
    StrategyOptionsWithRequest,
} from 'passport-google-oauth2';
import { config } from '../../config/app.config';
import { PassportStatic } from 'passport';
import { hashValue } from '../utils/bcrypt';
import UserModel, { UserDocument } from '../../database/models/user.model';
import { AppError } from '../utils/AppError';
import SessionModel from '../../database/models/session.model'; // Giả sử bạn có model này
import { signJwtToken, refreshTokenSignOptions } from '../utils/jwt'; // Hàm ký token của bạn

// Define interfaces
interface IProfile {
    provider: 'google';
    id: string;
    name: string;
    displayName: string;
    birthday: string;
    relationship: string;
    isPerson: boolean;
    isPlusUser: boolean;
    placesLived: string[];
    language: string;
    email: string;
    emails: { value: string; type?: string }[];
    gender: string;
    picture: string;
    coverPhoto: string;
}

const options: StrategyOptionsWithRequest = {
    callbackURL: `${config.APP_URL}/api/v1/auth/google/callback`,
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    passReqToCallback: true,
};

export const setupGoogleStrategy = (passport: PassportStatic): void => {
    passport.use(
        new GoogleStrategy(
            options,
            async (
                request: any,
                accessToken: string,
                refreshToken: string,
                profile: IProfile,
                done: (
                    error: any,
                    user?:
                        | {
                              user: UserDocument | null;
                              accessToken: string;
                              refreshToken: string;
                              mfaRequired: boolean;
                          }
                        | false
                ) => void
            ) => {
                try {
                    const primaryEmail = profile.emails?.[0]?.value || '';
                    const userAgent =
                        request.headers['user-agent'] || 'unknown';

                    if (!primaryEmail) {
                        return done(new AppError('Email is required', 400));
                    }

                    let user = await UserModel.findOne({
                        $or: [
                            { 'externalAccount.id': profile.id },
                            { email: primaryEmail },
                        ],
                    });

                    if (!user) {
                        user = new UserModel({
                            name: profile.displayName,
                            email: primaryEmail,
                            externalAccount: {
                                provider: profile.provider,
                                id: profile.id,
                                name: profile.displayName,
                                emails: profile.emails,
                                picture: profile.picture,
                            },
                            avatar: profile.picture,
                            isEmailVerified: true,
                            userPreferences: { enable2FA: false }, // Mặc định không bật 2FA
                            hasImage: true,
                            passwordEnable: false,
                        });
                        await user.save();
                    } else {
                        // Kiểm tra nếu email đã liên kết với tài khoản khác
                        if (
                            user.externalAccount?.id &&
                            user.externalAccount.id !== profile.id
                        ) {
                            return done(
                                new AppError(
                                    'Email already associated with another account',
                                    409
                                )
                            );
                        }

                        // Cập nhật thông tin user
                        user.name = profile.displayName;
                        user.email = primaryEmail;
                        user.externalAccount = {
                            provider: profile.provider,
                            id: profile.id,
                            name: profile.displayName,
                            emails: profile.emails,
                            picture: profile.picture,
                        };
                        user.isEmailVerified = true;
                        user.avatar = profile.picture;
                        user.hasImage = true;
                        
                        await user.save();
                    }
                    // Kiểm tra 2FA
                    if (user.userPreferences?.enable2FA) {
                        return done(null, {
                            user: null,
                            mfaRequired: true,
                            accessToken: '',
                            refreshToken: '',
                        });
                    }

                    // Tạo session
                    const session = await SessionModel.create({
                        userId: user._id,
                        userAgent,
                    });

                    // Tạo token
                    const jwtAccessToken = signJwtToken({
                        userId: user._id,
                        sessionId: session._id,
                    });

                    const jwtRefreshToken = signJwtToken(
                        { sessionId: session._id },
                        refreshTokenSignOptions
                    );

                    // Trả về thông tin đăng nhập
                    return done(null, {
                        user,
                        accessToken: jwtAccessToken,
                        refreshToken: jwtRefreshToken,
                        mfaRequired: false,
                    });
                } catch (error: any) {
                    if (error.code === 11000) {
                        return done(new AppError('Email already exists', 409));
                    }
                    return done(error);
                }
            }
        )
    );
};

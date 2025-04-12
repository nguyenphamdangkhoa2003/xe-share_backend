import {
    Strategy as GoogleStrategy,
    StrategyOptionsWithRequest,
} from 'passport-google-oauth2';
import { config } from '../../config/app.config';
import { PassportStatic } from 'passport';
import { hashValue } from '../utils/bcrypt';
import UserModel from '../../database/models/user.model';
import { AppError } from '../utils/AppError';
import SessionModel from '../../database/models/session.model'; // Giả sử bạn có model này
import { signJwtToken, refreshTokenSignOptions } from '../utils/jwt'; // Hàm ký token của bạn
import { UserDocument } from '../interface/user.interface';
import { AvatarProviderEnum } from '../enums/avatar-provider.enum';

// Define interfaces
interface IProfile {
    provider: 'google';
    id: string;
    name: string;
    displayName: string;
    birthday: Date;
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
    given_name: string;
    family_name: string;
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
                            { 'externalAccount.providerId': profile.id },
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
                            birthday: profile.birthday,
                            avatar: {
                                provider: AvatarProviderEnum.GOOGLE,
                                url: profile.picture,
                            },
                            isEmailVerified: true,
                            userPreferences: { enable2FA: false },
                            hasImage: true,
                            isDeleted: false,
                            lastSignInAt: new Date(),
                            givenName: profile.given_name,
                            familyName: profile.family_name,
                            passwordEnable: false,
                        });
                        await user.save();
                    } else {
                        if (
                            user.externalAccount?.providerId &&
                            user.externalAccount.providerId !== profile.id
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
                            providerId: profile.id,
                            name: profile.displayName,
                            emails: profile.emails,
                            picture: profile.picture,
                        };
                        user.isEmailVerified = true;
                        user.avatar = {
                            provider: AvatarProviderEnum.GOOGLE,
                            url: profile.picture,
                        };
                        user.hasImage = true;
                        user.birthday = profile.birthday;
                        user.givenName = profile.given_name;
                        user.familyName = profile.family_name;
                        user.lastSignInAt = new Date();
                        user.isDeleted = false;
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

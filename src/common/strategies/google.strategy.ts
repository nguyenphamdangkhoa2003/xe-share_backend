import {
    Strategy as GoogleStrategy,
    StrategyOptionsWithRequest,
} from 'passport-google-oauth2';
import { config } from '../../config/app.config';
import { PassportStatic } from 'passport';
import { hashValue } from '../utils/bcrypt';
import UserModel, { UserDocument } from '../../database/models/user.model';
import { AppError } from '../utils/AppError';

// Define interfaces
interface IProfile {
    provider: 'google'; // Literal type set to 'google'
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

// Strategy options configuration
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
                done: (error: any, user?: UserDocument | false) => void
            ) => {
                try {
                    // Tìm user bằng googleId
                    let user = await UserModel.findOne({
                        'externalAccount.id': profile.id,
                    });

                    const primaryEmail =
                        profile.emails && profile.emails.length > 0
                            ? profile.emails[0].value
                            : '';

                    if (!user) {
                        // Tạo user mới nếu không tồn tại
                        user = new UserModel({
                            name: profile.displayName,
                            email: primaryEmail,
                            password: await hashValue('some-random-password'),
                            externalAccount: {
                                provider: profile.provider,
                                id: profile.id,
                                name: profile.displayName,
                                emails: profile.emails,
                                picture: profile.picture,
                            },
                            isEmailVerified: true,
                        });
                        await user.save();
                    } else {
                        // Cập nhật thông tin user nếu đã tồn tại
                        const updatedUser = await UserModel.findOneAndUpdate(
                            { 'externalAccount.id': profile.id },
                            {
                                $set: {
                                    name: profile.displayName,
                                    email: primaryEmail,
                                    'externalAccount.name': profile.displayName,
                                    'externalAccount.emails': profile.emails,
                                    'externalAccount.picture': profile.picture,
                                    isEmailVerified: true,
                                },
                            },
                            { new: true }
                        );

                        // Nếu không tìm thấy user để cập nhật (hiếm khi xảy ra vì đã kiểm tra trước)
                        if (!updatedUser) {
                            return done(new AppError('Failed to update user'));
                        }
                        user = updatedUser;
                    }

                    // Trả về user
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
};

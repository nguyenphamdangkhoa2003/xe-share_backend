import {
    Strategy as GoogleStrategy,
    StrategyOptionsWithRequest,
} from 'passport-google-oauth2';
import { config } from '../../config/app.config';
import { PassportStatic } from 'passport';
import { hashValue } from '../utils/bcrypt';
import UserModel, { UserDocument } from '../../database/models/user.model';

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
                    let user = await UserModel.findOne({
                        'externalAccount.id': profile.id,
                    });

                    if (!user) {
                        // Tạo user mới nếu không tồn tại
                        user = new UserModel({
                            name: profile.name,
                            email: profile.emails[0].value, // Lấy email chính
                            password: await hashValue('some-random-password'),
                            externalAccount: {
                                provider: profile.provider,
                                id: profile.id,
                                name: profile.name,
                                emails: profile.emails,
                                picture: profile.picture,
                            },
                        });
                        await user.save();
                    }

                    // Trả về user với _id hợp lệ
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
};

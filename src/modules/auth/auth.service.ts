import jwt from 'jsonwebtoken';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { VerificationEnum } from '../../common/enums/verification-code.enum';
import { RegisterDto } from '../../common/interface/auth.interface';
import { BadRequestException } from '../../common/utils/catch-errors';
import { fortyFiveMinutesFromNow } from '../../common/utils/date-time';
import UserModel from '../../database/models/user.model';

import VerificationCodeModel from '../../database/models/verification.model';
import { config } from '../../config/app.config';
import { sendEmail } from '../../mailers/mailer';
import { verifyEmailTemplate } from '../../mailers/templates/template';

export class AuthService {
    public async register(registerData: RegisterDto) {
        const { name, email, password } = registerData;

        const existingUser = await UserModel.exists({
            email,
        });

        if (existingUser) {
            throw new BadRequestException(
                'User already exists with this email',
                ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
            );
        }
        const newUser = await UserModel.create({
            name,
            email,
            password,
        });

        const userId = newUser._id;

        const verification = await VerificationCodeModel.create({
            userId,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiresAt: fortyFiveMinutesFromNow(),
        });

        // Sending verification email link
        const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
        await sendEmail({
            to: newUser.email,
            ...verifyEmailTemplate(verificationUrl),
        });

        return {
            user: newUser,
        };
    }
}

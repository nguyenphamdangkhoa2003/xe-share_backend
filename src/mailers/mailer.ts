import { ErrorCode } from '../common/enums/error-code.enum';
import { InternalServerException } from '../common/utils/catch-errors';
import { config } from '../config/app.config';
import nodemailer, { TransportOptions } from 'nodemailer';

type Params = {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from?: string;
};

const transporter = nodemailer.createTransport({
    host: config.NODEMAILER_HOST,
    port: config.NODEMAILER_PORT,
    secure: true,
    auth: {
        user: config.NODEMAILER_USER,
        pass: config.NODEMAILER_PASSWORD,
    },
} as TransportOptions);

const mailer_sender =
    config.NODE_ENV === 'development'
        ? `no-reply <onboarding@resend.dev>`
        : `no-reply <${config.MAILER_SENDER}>`;

export const sendEmail = async ({
    to,
    from = mailer_sender,
    subject,
    text,
    html,
}: Params) => {
    try {
        const info = await transporter.sendMail({
            from,
            to: Array.isArray(to) ? to : [to],
            text,
            subject,
            html,
        });

        if (!info.messageId) {
            throw new InternalServerException(`Email sending failed`);
        }
        console.log('Mail sent');
        return info;
    } catch (error) {
        throw new InternalServerException(
            `Send mail fail: ${error}`,
            ErrorCode.INTERNAL_SERVER_ERROR
        );
    }
};

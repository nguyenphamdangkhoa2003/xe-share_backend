import { Request } from 'express';
import { UserDocument } from '../common/interface/user.interface';

declare global {
    namespace Express {
        interface User extends UserDocument {}
        interface Request {
            sessionId?: string;
        }
    }
}

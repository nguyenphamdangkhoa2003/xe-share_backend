import { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/utils/AppError';
import { UnauthorizedException } from '../common/utils/catch-errors';
import { RoleEnum } from '../common/enums/role.enum';

export const restrictTo = (roles: RoleEnum[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new UnauthorizedException());
        }
        next();
    };
};

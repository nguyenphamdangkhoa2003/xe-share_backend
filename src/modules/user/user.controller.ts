import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { UserService } from './user.service';
import {
    BadRequestException,
    NotFoundException,
} from '../../common/utils/catch-errors';
import { HTTPSTATUS } from '../../config/http.config';
import { AvatarService } from '../avatar/avatar.service';
import { RoleEnum } from '../../common/enums/role.enum';

export class UserController {
    private userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }

    public deleteUser = asyncHandler(async (req: Request, res: Response) => {
        const user_id = req.params.user_id;
        if (!user_id) throw new BadRequestException('User id require');

        await this.userService.deleteUserById(user_id);
        return res.status(HTTPSTATUS.OK).json({
            message: `Delete user # ${user_id} successfully`,
        });
    });

    public listAllUser = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query.search;
        const users = await this.userService.getUsers(query as string);
        return res.status(HTTPSTATUS.OK).json({ data: users });
    });

    public getUserById = asyncHandler(async (req: Request, res: Response) => {
        const user_id = req.params.user_id;
        if (!user_id) throw new BadRequestException('User id is require');

        const user = await this.userService.findUserById(user_id as string);
        if (!user) throw new NotFoundException('User not found');
        return res.status(HTTPSTATUS.OK).json({
            data: user,
        });
    });

    public banUserById = asyncHandler(async (req: Request, res: Response) => {
        const { user_id } = req.body;
        console.log(req.body);
        if (!user_id) throw new BadRequestException('User id is require');
        const user = this.userService.toggleBanUser(user_id);
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            data: user,
        });
    });
    public unbanUserById = asyncHandler(async (req: Request, res: Response) => {
        const { user_id } = req.body;
        if (!user_id) throw new BadRequestException('User id is require');
        const user = this.userService.toggleBanUser(user_id, false);
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            data: user,
        });
    });
    public updateUserById = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const user_id = req.params.user_id;
            if (!user_id) throw new BadRequestException('User id is require');
            const user = this.userService.UpdateUser(user_id, req.body);
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                data: user,
            });
        }
    );
    public setPasswordUserById = asyncHandler(
        async (req: Request, res: Response) => {
            const user_id = req.params.user_id;
            if (!user_id) throw new BadRequestException('User id is require');
            const user = await this.userService.setPassword(user_id, req.body);
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                data: user,
            });
        }
    );

    public setAvatarUserByID = asyncHandler(
        async (req: Request, res: Response) => {
            const user_id = req.params.user_id;
            const file = req.file;
            if (!user_id) throw new BadRequestException('User id là bắt buộc');
            if (!file) throw new BadRequestException('Không có file đính kèm');

            const user = await this.userService.uploadAvatar(user_id, file);
            return res.status(HTTPSTATUS.OK).json({
                avatar: user,
                success: true,
            });
        }
    );

    public removeAvatarUserById = asyncHandler(
        async (req: Request, res: Response) => {
            const user_id = req.params.user_id;
            const user = await this.userService.removeAvatar(user_id);
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                data: user,
            });
        }
    );

    public updateUserRole = asyncHandler(async (req: Request, res: Response) => {
        const user_id = req.params.user_id;
        const { role } = req.body;

        if (!user_id) throw new BadRequestException('User id is required');
        if (!role) throw new BadRequestException('Role is required');
        if (!Object.values(RoleEnum).includes(role)) {
            throw new BadRequestException('Invalid role');
        }

        const user = await this.userService.updateUserRole(user_id, role as RoleEnum);
        
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            data: user,
            message: `User role updated successfully to ${role}`
        });
    });
}

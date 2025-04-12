import {
    InternalServerException,
    NotFoundException,
} from '../../common/utils/catch-errors';
import SessionModel from '../../database/models/session.model';
import UserModel from '../../database/models/user.model';
import { avatarService } from '../avatar/avatar.module';
import { SessionService } from '../session/session.service';
import { userService } from './user.module';

export class UserService {
    public async findUserById(userId: string) {
        const user = await UserModel.findById(userId, {
            password: false,
        });
        return user || null;
    }

    public async deleteUserById(userId: string) {
        try {
            const deletedUser = await UserModel.softDelete(userId);
            if (!deletedUser) {
                throw new NotFoundException('User not found');
            }
            return deletedUser;
        } catch (error) {
            const err = error as Error;
            throw new InternalServerException(
                `Failed to delete user: ${err.message}`
            );
        }
    }

    public async getUsers(search: string) {
        try {
            if (search === '') {
                const data = await UserModel.find().exec(); // Thêm await ở đây
                return data;
            }

            const query: any = {};
            query.$or = [
                { name: { $regex: new RegExp(search, 'i') } },
                { email: { $regex: new RegExp(search, 'i') } },
            ];

            const users = await UserModel.find(query).exec();
            return users;
        } catch (error) {
            const err = error as Error;
            throw new InternalServerException(
                `Failed to get all user: ${err.message}`
            );
        }
    }

    public async toggleBanUser(user_id: string, banned = true) {
        const user = UserModel.findOneAndUpdate(
            {
                _id: user_id,
            },
            {
                banned,
            },
            {
                new: true,
            }
        );
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    public async UpdateUser(user_id: string, data: any) {
        const user = UserModel.findByIdAndUpdate(user_id, data, { new: true });
        if (!user) throw new NotFoundException('Không tìm thấy người dùng');
        return user;
    }

    public async setPassword(
        user_id: string,
        data: {
            password: string;
            sign_out_of_other_sessions: boolean;
        }
    ) {
        const user = await UserModel.findById(user_id);
        if (!user) throw new NotFoundException('Không tìm thấy người dùng');

        user.password = data.password;
        user.passwordEnable = true;
        await user.save();

        if (data.sign_out_of_other_sessions) {
            await SessionModel.deleteMany({ userId: user_id });
        }

        return user;
    }

    public async uploadAvatar(user_id: string, file: Express.Multer.File) {
        const user = await UserModel.findById(user_id).exec();
        if (!user) return new NotFoundException('Không tìm thấy người dùng');
        const currentAvatar = user.avatar;
        const avatarData = await avatarService.uploadNewAvatar(
            currentAvatar || null,
            file
        );
        user.avatar = avatarData;
        user.hasImage = true;
        user.save();
        return user;
    }

    public async removeAvatar(user_id: string) {
        const user = await UserModel.findById(user_id).exec();
        if (!user) return new NotFoundException('Không tìm thấy người dùng');
        avatarService.deleteAvatarIfExists(user?.avatar);
        user.avatar = undefined;
        user.hasImage = false;
        user.save();
        return user;
    }
}

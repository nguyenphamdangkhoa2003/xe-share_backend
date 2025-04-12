import { AvatarProviderEnum } from '../../common/enums/avatar-provider.enum';
import { IAvatar } from '../../common/interface/user.interface';
import { InternalServerException } from '../../common/utils/catch-errors';
import { cloudinary } from '../../config/cloundinary.config';

export class AvatarService {
    async uploadNewAvatar(
        currentAvatar: IAvatar | null, // Cho phép null hoặc undefined
        file: Express.Multer.File
    ): Promise<IAvatar> {
        // Xóa avatar cũ nếu tồn tại và là từ Cloudinary
        if (
            currentAvatar?.provider === AvatarProviderEnum.CLOUDINARY &&
            currentAvatar?.publicId
        ) {
            await this.deleteCloudinaryAvatar(currentAvatar.publicId);
        }

        return {
            url: file.path,
            publicId: file.filename,
            provider: AvatarProviderEnum.CLOUDINARY,
        };
    }

    async deleteAvatarIfExists(
        avatar: IAvatar | null | undefined
    ): Promise<void> {
        if (
            avatar?.provider === AvatarProviderEnum.CLOUDINARY &&
            avatar?.publicId
        ) {
            await this.deleteCloudinaryAvatar(avatar.publicId);
        }
    }

    private async deleteCloudinaryAvatar(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Failed to delete Cloudinary avatar:', error);
            throw new InternalServerException('AVATAR_DELETE_FAILED');
        }
    }
}

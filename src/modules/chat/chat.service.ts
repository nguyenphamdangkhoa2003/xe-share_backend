import { NotFoundException } from '../../common/utils/catch-errors';
import { config } from '../../config/app.config';
import UserModel from '../../database/models/user.model';
import { StreamChat } from 'stream-chat';

export class ChatService {
    public createToken = (user_id: string) => {
        const user = UserModel.findById(user_id);
        if (!user) throw new NotFoundException('Không tìm thấy user');
        const streamClient = StreamChat.getInstance(
            config.PUBLIC_STREAM_KEY,
            config.STREAM_SECRET
        );

        const token = streamClient.createToken(user_id);
        return token;
    };
}

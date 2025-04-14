import { Response, Request } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { ChatService } from './chat.service';

import {
    BadRequestException,
    NotFoundException,
} from '../../common/utils/catch-errors';
import { HTTPSTATUS } from '../../config/http.config';

export class ChatController {
    private chatSerivice: ChatService;
    constructor(chatService: ChatService) {
        this.chatSerivice = chatService;
    }

    public getToken = asyncHandler(async (req: Request, res: Response) => {
        const user_id = req.params.user_id;
        if (!user_id) throw new BadRequestException('Không nhận được user id');
        const token = await this.chatSerivice.createToken(user_id);
        return res.status(HTTPSTATUS.OK).json({
            success: true,
            token,
        });
    });
}

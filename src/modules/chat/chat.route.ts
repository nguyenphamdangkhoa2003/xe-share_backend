import { Router } from 'express';
import { chatController } from './chat.module';

const chatRoute = Router();

chatRoute.get('/get-token/:user_id', chatController.getToken);

export { chatRoute };

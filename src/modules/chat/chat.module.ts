import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

const chatService = new ChatService();
const chatController = new ChatController(chatService);
export { chatController, chatService };

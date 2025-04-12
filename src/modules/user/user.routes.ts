import { Router } from 'express';
import { userController } from './user.module';
import { uploadSingle } from '../../middlewares/upload';

const userRoutes = Router();

userRoutes.delete('/:user_id', userController.deleteUser);
userRoutes.get('/:user_id', userController.getUserById);
userRoutes.get('/', userController.listAllUser);
userRoutes.post('/ban', userController.banUserById);
userRoutes.post('/unban', userController.unbanUserById);
userRoutes.put('/:user_id', userController.updateUserById);
userRoutes.put('/set-password/:user_id', userController.setPasswordUserById);
userRoutes.put(
    '/set-avatar/:user_id',
    uploadSingle('avatar'),
    userController.setAvatarUserByID
);
userRoutes.delete(
    '/remove-avatar/:user_id',
    userController.removeAvatarUserById
);
export { userRoutes };

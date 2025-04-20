import { Router } from 'express';
import { websiteController } from './website.module';

const websiteRouter = Router();

websiteRouter.get('/content', websiteController.GET);
websiteRouter.put('/content', websiteController.UPDATE);

export { websiteRouter };

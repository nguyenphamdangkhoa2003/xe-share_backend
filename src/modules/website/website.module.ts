import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';

const websiteService = new WebsiteService();
const websiteController = new WebsiteController(websiteService);

export { websiteController, websiteService };

import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { WebsiteService } from './website.service';

export class WebsiteController {
    private websiteService: WebsiteService;

    constructor(websiteService: WebsiteService) {
        this.websiteService = websiteService;
    }

    public GET = asyncHandler(async (req: Request, res: Response) => {
        const content = await this.websiteService.getContent();
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nội dung website',
            });
        }
        return res.status(200).json({
            success: true,
            data: content,
        });
    });

    public UPDATE = asyncHandler(async (req: Request, res: Response) => {
        const updateData: Partial<IWebsite> = req.body;
        const updatedContent = await this.websiteService.updateContent(
            updateData
        );
        if (!updatedContent) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nội dung website để cập nhật',
            });
        }
        return res.status(200).json({
            success: true,
            data: updatedContent,
        });
    });
}

import WebsiteModel from '../../database/models/website.model';

export class WebsiteService {
    public async getContent(): Promise<IWebsite | null> {
        try {
            const data = await WebsiteModel.findOne();
            if (!data) {
                console.log(
                    'Không tìm thấy dữ liệu website, khởi tạo dữ liệu mặc định...'
                );
                await this.intialContent();
                return await WebsiteModel.findOne();
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy nội dung website:', error);
            throw new Error('Không thể lấy nội dung website');
        }
    }
    public async updateContent(
        updateData: Partial<IWebsite>
    ): Promise<IWebsite | null> {
        try {
            const updatedWebsite = await WebsiteModel.findOneAndUpdate(
                {}, // Tìm tài liệu đầu tiên
                { $set: updateData },
                { new: true, runValidators: true } // Trả về tài liệu mới và chạy validator
            );
            if (!updatedWebsite) {
                throw new Error('Không tìm thấy tài liệu website để cập nhật');
            }
            console.log('Cập nhật nội dung website thành công');
            return updatedWebsite;
        } catch (error) {
            console.error('Lỗi khi cập nhật nội dung website:', error);
            throw new Error('Không thể cập nhật nội dung website');
        }
    }
    private async intialContent() {
        try {
            const defaultData: IWebsite = {
                contact: {
                    phone: '+84 326654505',
                    email: 'support@xeshare.vn',
                    address: '123 Đường Láng, Quận Đống Đa, Hà Nội, Việt Nam',
                    googleMapUrl:
                        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.123456789!2d105.823456789!3d21.0123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAwJzQzLjciTiAxMDXCsDQ5JzI0LjUiRQ!5e0!3m2!1sen!2s!4v1634567890123',
                },
                about: {
                    intro: {
                        title: 'Giới thiệu về Công ty XeShare',
                        description:
                            'Công ty XeShare là một công ty công nghệ hàng đầu, chuyên cung cấp các giải pháp phần mềm sáng tạo và dịch vụ tư vấn cho khách hàng toàn cầu. Với sứ mệnh mang lại giá trị vượt trội, chúng tôi cam kết xây dựng tương lai số hóa bền vững.',
                        image: 'https://res.cloudinary.com/dff6pkxpt/image/upload/v1745135865/image_rlgdrs.jpg',
                        imagePublicId: 'image_rlgdrs',
                    },
                    sections: [
                        {
                            id: 'section1',
                            title: 'Lịch sử và Tầm nhìn',
                            content:
                                'Công ty XeShare được thành lập vào năm 2010, với đội ngũ chuyên gia giàu kinh nghiệm trong các lĩnh vực công nghệ thông tin, trí tuệ nhân tạo, và phát triển phần mềm. Chúng tôi tự hào đã phục vụ hơn 500 khách hàng trên toàn thế giới, từ các startup đến các tập đoàn lớn. Tầm nhìn của chúng tôi là trở thành công ty công nghệ tiên phong tại khu vực Đông Nam Á.',
                        },
                    ],
                    team: [
                        {
                            name: 'Dương Nhất Thiên',
                            position: 'Giám đốc Điều hành',
                            bio: 'Ông Dương Nhất Thiên có hơn 15 năm kinh nghiệm trong lĩnh vực công nghệ, từng dẫn dắt nhiều dự án lớn tại Việt Nam và quốc tế. Ông là người truyền cảm hứng cho đội ngũ XeShare đạt được những thành tựu vượt bậc.',
                            image: 'https://res.cloudinary.com/dff6pkxpt/image/upload/v1745126985/DH52106994_st8yc7.jpg',
                            imagePublicId: 'DH52106994_st8yc7',
                            socialMedia: {
                                facebook:
                                    'https://www.facebook.com/iwillcoder.203/',
                                linkedin: 'https://linkedin.com',
                                twitter: 'https://twitter.com',
                                instagram: undefined,
                            },
                        },
                        {
                            name: 'Phạm Mạnh Tuấn',
                            position: 'Giám đốc Công nghệ',
                            bio: 'Ông Phạm Mạnh Tuấn là chuyên gia trong lĩnh vực trí tuệ nhân tạo và phát triển phần mềm. Ông đã đóng góp vào việc xây dựng các sản phẩm công nghệ tiên tiến của XeShare, mang lại giá trị lớn cho khách hàng.',
                            image: 'https://res.cloudinary.com/dff6pkxpt/image/upload/v1745126853/DH52100999_g0vmf0.jpg',
                            imagePublicId: 'DH52100999_g0vmf0',
                            socialMedia: {
                                facebook:
                                    'https://www.facebook.com/profile.php?id=100032348439874',
                                linkedin: 'https://linkedin.com/in',
                                twitter: 'https://twitter.com',
                                instagram: undefined,
                            },
                        },
                    ],
                },
                footer: {
                    phone: '+84 123 456 789',
                    email: 'info@company.com',
                    address: '123 Đường Láng, Quận Đống Đa, Hà Nội, Việt Nam',
                    socialLinks: {
                        facebook: 'https://facebook.com',
                        linkedin: 'https://linkedin.com',
                        twitter: 'https://twitter.com',
                        instagram: 'https://instagram.com',
                    },
                    links: [
                        {
                            name: 'Chính sách',
                            url: '/policy',
                        },
                        {
                            name: 'Hỗ trợ khách hàng',
                            url: '/support',
                        },
                        {
                            name: 'Điều khoản dịch vụ',
                            url: '/terms',
                        },
                        {
                            name: 'Câu hỏi thường gặp',
                            url: '/faq',
                        },
                    ],
                },
                isWebsiteShutdown: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await WebsiteModel.create(defaultData);
            console.log('Dữ liệu mặc định đã được chèn thành công!');
        } catch (error) {
            console.error('Lỗi khi chèn dữ liệu:', error);
        }
    }
}

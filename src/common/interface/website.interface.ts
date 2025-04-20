// Interface cho đội ngũ
interface ITeamMember {
    name: string;
    position: string;
    bio: string;
    image?: string; // URL của ảnh từ Cloudinary
    imagePublicId?: string; // public_id của ảnh trên Cloudinary
    socialMedia?: {
        facebook?: string;
        linkedin?: string;
        twitter?: string;
        instagram?: string;
    };
}

// Interface cho trang About
interface IAbout {
    intro?: {
        title: string;
        description: string;
        image?: string; // URL của ảnh từ Cloudinary
        imagePublicId?: string; // public_id của ảnh trên Cloudinary
    };
    sections?: {
        id: string;
        title: string;
        content: string;
    }[];
    team: ITeamMember[];
}

// Interface cho trang Contact
interface IContact {
    phone: string; // Số điện thoại
    email: string; // Email
    address: string; // Địa chỉ
    googleMapUrl: string; // Đường dẫn Google Map
}

// Interface cho Footer
interface IFooter {
    phone: string;
    email: string;
    address: string;
    socialLinks: {
        facebook?: string | null;
        linkedin?: string | null;
        twitter?: string | null;
        instagram?: string | null;
    };
    links: {
        name: string;
        url: string;
    }[];
}

// Interface chính cho Website
interface IWebsite {
    contact: IContact;
    about: IAbout;
    footer: IFooter;
    createdAt: Date;
    updatedAt: Date;
    isWebsiteShutdown: boolean;
}

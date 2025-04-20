import { Schema, model, Document } from 'mongoose';

// Schema cho đội ngũ
const TeamMemberSchema = new Schema<ITeamMember>({
    name: { type: String, required: true },
    position: { type: String, required: true },
    bio: { type: String, required: true },
    image: { type: String, required: false },
    imagePublicId: { type: String, required: false }, // Thêm trường imagePublicId
    socialMedia: {
        facebook: { type: String, default: null },
        linkedin: { type: String, default: null },
        twitter: { type: String, default: null },
        instagram: { type: String, default: null },
    },
});

// Schema cho trang About
const AboutSchema = new Schema<IAbout>({
    intro: {
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: false },
        imagePublicId: { type: String, required: false }, // Thêm trường imagePublicId
    },
    sections: [
        {
            id: { type: String, required: true },
            title: { type: String, required: true },
            content: { type: String, required: true },
        },
    ],
    team: [TeamMemberSchema],
});

// Schema cho trang Contact
const ContactSchema = new Schema<IContact>({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    googleMapUrl: { type: String, required: true },
});

// Schema cho Footer
const FooterSchema = new Schema<IFooter>({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    socialLinks: {
        facebook: { type: String, default: null },
        linkedin: { type: String, default: null },
        twitter: { type: String, default: null },
        instagram: { type: String, default: null },
    },
    links: [
        {
            name: { type: String, required: true },
            url: { type: String, required: true },
        },
    ],
});

// Schema chính cho Website
const WebsiteSchema = new Schema<IWebsite>(
    {
        contact: { type: ContactSchema, required: true },
        about: { type: AboutSchema, required: true },
        footer: { type: FooterSchema, required: true },
        isWebsiteShutdown: {
            type: Boolean,
            default: false,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Tạo model
const WebsiteModel = model<IWebsite>('Website', WebsiteSchema);

export default WebsiteModel;

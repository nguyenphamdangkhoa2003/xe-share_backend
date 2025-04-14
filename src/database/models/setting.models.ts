import { Schema, model } from 'mongoose';
const imageSchema = new Schema({
    url: { type: String, required: true },
    alt_text: { type: String, required: true },
    public_id: { type: String, required: true }, 
});

const homeContentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const contactInfoSchema = new Schema({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    google_map_url: { type: String, required: true },
});

const footerContactSchema = new Schema({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
});

const socialMediaSchema = new Schema({
    platform: { type: String, required: true },
    url: { type: String, required: true },
});

const homeSchema = new Schema({
    banner_image: imageSchema,
    content: [homeContentSchema],
});

const aboutSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: imageSchema,
});

const footerSchema = new Schema({
    contact: footerContactSchema,
    social_media: [socialMediaSchema],
});

const websiteContentSchema = new Schema({
    home: homeSchema,
    contact: contactInfoSchema,
    about: aboutSchema,
    footer: footerSchema,
});

// Tạo model
const WebsiteContent = model<IWebsiteContent>(
    'WebsiteContent',
    websiteContentSchema
);

export default WebsiteContent;

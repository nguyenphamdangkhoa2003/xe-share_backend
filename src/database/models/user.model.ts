import mongoose, { Document, Schema } from 'mongoose';
import { compareValue, hashValue } from '../../common/utils/bcrypt';
import { RoleEnum } from '../../common/enums/role.enum';
import { string } from 'zod';

// Interface for User Preferences
interface UserPreferences {
    enable2FA: boolean;
    emailNotification: boolean;
    twoFactorSecret?: string;
}

// Simplified External Account interface for User model
export interface ExternalAccount {
    provider: 'google';
    id: string;
    name: string;
    emails: { value: string; type?: string }[];
    picture: string;
}

// User Document interface
export interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    isEmailVerified: boolean;
    createdAt: Date;
    hasImage: boolean;
    updatedAt: Date;
    avatar: string;
    userPreferences: UserPreferences;
    externalAccount?: ExternalAccount;
    role: RoleEnum;
    passwordEnable: boolean;
    comparePassword(value: string): Promise<boolean>;
}

// User Preferences Schema
const userPreferencesSchema = new Schema<UserPreferences>({
    enable2FA: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    twoFactorSecret: { type: String, required: false },
});

// Simplified External Account Schema
const externalAccountSchema = new Schema<ExternalAccount>({
    provider: {
        type: String,
        enum: ['google'],
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    emails: [
        {
            value: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: false,
            },
        },
    ],
    picture: {
        type: String,
        required: true,
    },
});

// User Schema
const userSchema = new Schema<UserDocument>(
    {
        avatar: {
            type: String,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        userPreferences: {
            type: userPreferencesSchema,
            default: {},
        },
        externalAccount: {
            type: externalAccountSchema,
            required: false,
        },
        role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.PASSENGER,
        },
        passwordEnable: {
            type: Boolean,
            default: true,
        },
        hasImage: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hashValue(this.password);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (value: string) {
    return compareValue(value, this.password);
};

// Transform toJSON to remove sensitive fields
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.userPreferences.twoFactorSecret;
        return ret;
    },
});

// Create and export the model
const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;

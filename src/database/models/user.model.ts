import mongoose, { Model, Schema } from 'mongoose';
import { compareValue } from '../../common/utils/bcrypt';
import { RoleEnum } from '../../common/enums/role.enum';
import { GenderEnum } from '../../common/enums/gender.enum';
import { IdentityVerifiedEnum } from '../../common/enums/identity-verified.enum';
import {
    AvatarDocument,
    DriverInfoDocument,
    ExternalAccountDocument,
    UserDocument,
    UserPreferenceDocument,
} from '../../common/interface/user.interface';
import { AvatarProviderEnum } from '../../common/enums/avatar-provider.enum';

// Define interfaces

const DriverInfoSchema = new Schema<DriverInfoDocument>(
    {
        idPortraitImage: { type: String, required: false },
        extractedIdNumber: { type: String, required: false },
        extractedFullName: { type: String, required: false },
        extractedDob: { type: String, required: false },
        extractedGender: { type: String, required: false },
        extractedAddress: { type: String, required: false },
        extractedLicenseNumber: { type: String, required: false },
        extractedLicenseClass: { type: String, required: false },
        extractedLicenseIssueDate: { type: String, required: false },
        extractedLicenseExpiryDate: { type: String, required: false },
        extractedLicensePlace: { type: String, required: false },
        extractedPlateNumber: { type: String, required: false },
        extractedVehicleOwner: { type: String, required: false },
        extractedVehicleType: { type: String, required: false },
        extractedVehicleBrand: { type: String, required: false },
        extractedVehicleChassisNumber: { type: String, required: false },
        extractedVehicleEngineNumber: { type: String, required: false },
        extractedVehicleRegistrationDate: { type: String, required: false },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

interface UserModel extends Model<UserDocument> {
    softDelete(id: string): Promise<UserDocument | null>;
    findActive(query?: any): Promise<UserDocument[]>;
    findOneActive(query: any): Promise<UserDocument | null>;
}
// Schemas
const userPreferencesSchema = new Schema<UserPreferenceDocument>({
    enable2FA: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    twoFactorSecret: { type: String },
});

const externalAccountSchema = new Schema<ExternalAccountDocument>({
provider: { type: String, enum: ['google'], required: true },
    providerId: { type: String, required: true },
    name: { type: String, required: true },
    emails: [
        {
            value: { type: String, required: true },
            type: { type: String },
        },
    ],
    picture: { type: String, required: true },
});
const avatarSchema = new Schema<AvatarDocument>({
    url: String,
    provider: {
        type: String,
        enum: Object.values(AvatarProviderEnum),
        default: AvatarProviderEnum.DEFAULT,
    },
    publicId: {
        type: String,
        required: false,
    },
});
const userSchema = new Schema<UserDocument>(
    {
        avatar: { type: avatarSchema, required: false },
        name: { type: String },
        givenName: { type: String, required: true },
        familyName: { type: String, required: true },
        email: { type: String, unique: true, required: true, index: true },
        password: { type: String },
        isEmailVerified: { type: Boolean, default: false },
        userPreferences: { type: userPreferencesSchema, default: () => ({}) },
        externalAccount: { type: externalAccountSchema },
        role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.PASSENGER,
        },
        passwordEnable: { type: Boolean, default: true },
        hasImage: { type: Boolean, default: false },
        banned: { type: Boolean, default: false },
        lastSignInAt: { type: Date },
        gender: {
            type: String,
            enum: Object.values(GenderEnum),
            default: GenderEnum.FEMALE,
        },
        deleteSelfEnabled: {
            type: Boolean,
            default: false,
        },
        birthday: { type: Date },
        isDeleted: { type: Boolean, default: false, index: true },
        identityVerified: {
            type: String,
            enum: Object.values(IdentityVerifiedEnum),
            default: IdentityVerifiedEnum.UNVERIFIED,
        },
        driverInfo: {
            type: DriverInfoSchema,
            required: false,
        },
        rating: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.userPreferences?.twoFactorSecret;
                return ret;
            },
        },
    }
);

// Methods
userSchema.methods.comparePassword = async function (
    value: string
): Promise<boolean> {
    if (!this.password) return false;
    return compareValue(value, this.password);
};
userSchema.statics.softDelete = function (id: string) {
    return this.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
};
userSchema.statics.findActive = function (query: any) {
    // Luôn thêm điều kiện isDeleted: false vào query
    return this.find({ ...query, isDeleted: false });
};

// Hoặc cho findOne (nếu cần)
userSchema.statics.findOneActive = function (query?: any) {
    return this.findOne({ ...query, isDeleted: false });
};
// Model
const UserModel = mongoose.model<UserDocument, UserModel>('User', userSchema);
export default UserModel;

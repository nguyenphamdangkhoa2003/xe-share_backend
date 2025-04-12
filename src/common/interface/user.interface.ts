import { Document } from 'mongoose';
import { AvatarProviderEnum } from '../enums/avatar-provider.enum';
import { GenderEnum } from '../enums/gender.enum';
import { IdentityVerifiedEnum } from '../enums/identity-verified.enum';
import { RoleEnum } from '../enums/role.enum';

// Base interfaces (không extend Document)
export interface IUserPreference {
    enable2FA: boolean;
    emailNotification: boolean;
    twoFactorSecret?: string;
}

export interface IDriverInfo {
    idPortraitImage?: string;
    extractedIdNumber?: string;
    extractedFullName?: string;
    extractedDob?: string;
    extractedGender?: string;
    extractedAddress?: string;
    extractedLicenseNumber?: string;
    extractedLicenseClass?: string;
    extractedLicenseIssueDate?: string;
    extractedLicenseExpiryDate?: string;
    extractedLicensePlace?: string;
    extractedPlateNumber?: string;
    extractedVehicleOwner?: string;
    extractedVehicleType?: string;
    extractedVehicleBrand?: string;
    extractedVehicleChassisNumber?: string;
    extractedVehicleEngineNumber?: string;
    extractedVehicleRegistrationDate?: string;
}

export interface IExternalAccount {
    provider: 'google';
    providerId: string;
    name: string;
    emails: { value: string; type?: string }[];
    picture: string;
}

export interface IAvatar {
    url: string;
    provider: AvatarProviderEnum;
    publicId?: string;
}

export interface IUser {
    name?: string;
    givenName: string;
    familyName: string;
    birthday?: Date;
    gender: GenderEnum;
    email: string;
    password?: string;
    isEmailVerified: boolean;
    deleteSelfEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    avatar?: IAvatar;
    hasImage: boolean;
    userPreferences: IUserPreference;
    externalAccount?: IExternalAccount;
    role: RoleEnum;
    lastSignInAt?: Date;
    banned: boolean;
    rating: number;
    passwordEnable: boolean;
    identityVerified: IdentityVerifiedEnum;
    driverInfo: IDriverInfo;
    isDeleted: boolean;
    comparePassword(value: string): Promise<boolean>;
}

// Mongoose Document interfaces
export interface UserPreferenceDocument extends IUserPreference, Document {}
export interface DriverInfoDocument extends IDriverInfo, Document {}
export interface ExternalAccountDocument extends IExternalAccount, Document {}
export interface AvatarDocument extends IAvatar, Document {}
export interface UserDocument extends IUser, Document {}

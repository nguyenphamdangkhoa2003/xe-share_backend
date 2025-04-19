import mongoose, { Model, Schema } from 'mongoose';
import { UserDocument } from '../../common/interface/user.interface';
import { RoleEnum } from '../../common/enums/role.enum';
import { TripStatusEnum } from '../../common/enums/trip-status.enum';

// Interface cho document của RouteTrip
export interface RouteTripDocument extends mongoose.Document {
    userId: mongoose.Types.ObjectId | UserDocument;
    tripCode: string;
    startLocation: {
        address: string;
        placeid: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    endLocation: {
        address: string;
        placeid: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    waypoints?: Array<{
        address: string;
        placeid: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    }>;
    schedule: {
        startTime: Date;
        endTime?: Date;
        recurring?: {
            daysOfWeek: number[];
            frequency: 'daily' | 'weekly' | 'monthly';
        };
    };
    availableSeats?: number;
    status: TripStatusEnum;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

// Interface cho model với các static methods
interface RouteTripModel extends Model<RouteTripDocument> {
    softDelete(id: string): Promise<RouteTripDocument | null>;
    findActive(query?: any): Promise<RouteTripDocument[]>;
    findOneActive(query: any): Promise<RouteTripDocument | null>;
}


// Schema cho RouteTrip
const RouteTripSchema = new Schema<RouteTripDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        tripCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        startLocation: {
            address: { type: String, required: true },
            placeid: { type: String, required: true },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
        },
        endLocation: {
            address: { type: String, required: true },
            placeid: { type: String, required: true },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
        },
        waypoints: [
            {
                address: { type: String },
                placeid: { type: String },
                coordinates: {
                    lat: { type: Number },
                    lng: { type: Number },
                },
            },
        ],
        schedule: {
            startTime: { type: Date, required: true },
            endTime: { type: Date },
            recurring: {
                daysOfWeek: [{ type: Number, min: 0, max: 6 }],
                frequency: {
                    type: String,
                    enum: ['daily', 'weekly', 'monthly'],
                },
            },
        },
        availableSeats: {
            type: Number,
            min: 0,
            default: 0,
        },
        status: {
            type: String,
            enum: Object.values(TripStatusEnum),
            default: TripStatusEnum.PENDING,
        },
        notes: { type: String },
        isDeleted: { type: Boolean, default: false, index: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

RouteTripSchema.pre('save', async function (next) {
    try {
        console.log('Running pre-save middleware for trip:', this._id);

        // Kiểm tra userId hợp lệ
        if (this.isNew || this.isModified('userId')) {
            console.log('Checking userId:', this.userId);
            const user = await mongoose.model('User').findOne({ _id: this.userId, isDeleted: false });
            if (!user) {
                console.log('User not found for userId:', this.userId);
                return next(new Error('User not found'));
            }

            // Kiểm tra availableSeats nếu user là DRIVER
            if (user.role === RoleEnum.DRIVER && this.availableSeats === undefined) {
                console.log('availableSeats required for DRIVER role');
                return next(new Error('availableSeats is required for DRIVER role'));
            }
        }

        // Kiểm tra tripCode unique (vẫn cần kiểm tra trong trường hợp có logic khác tạo tripCode)
        if (this.isNew || this.isModified('tripCode')) {
            const existingTrip = await RouteTripModel.findOne({ 
                tripCode: this.tripCode, 
                isDeleted: false 
            });
            if (existingTrip) {
                return next(new Error('Trip code already exists'));
            }
        }

        console.log('Pre-save middleware completed successfully');
        next();
    } catch (error) {
        console.error('Error in pre-save middleware:', error);
    }
});

// Static methods
RouteTripSchema.statics.softDelete = function (id: string) {
    return this.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
};

RouteTripSchema.statics.findActive = function (query: any = {}) {
    return this.find({ ...query, isDeleted: false });
};

RouteTripSchema.statics.findOneActive = function (query: any) {
    return this.findOne({ ...query, isDeleted: false });
};

const RouteTripModel = mongoose.model<RouteTripDocument, RouteTripModel>('trips', RouteTripSchema);

export default RouteTripModel;
import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { TripService } from './trip.service';
import { z } from 'zod';
import mongoose from 'mongoose';
// Schema cho getDirections
const directionSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicle: z.enum(['car', 'bike', 'foot']).optional().default('car'),
});

// Schema cho getPlaceAutocomplete
const autocompleteSchema = z.object({
  input: z.string().min(1, 'Input is required'),
});

// Schema cho getGeocode
const geocodeSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

const createTripSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time',
  }),
  endTime: z
    .string()
    .refine((val) => (val ? !isNaN(Date.parse(val)) : true), {
      message: 'Invalid end time',
    })
    .optional(),
  availableSeats: z.number().min(0, 'Available seats must be non-negative').optional(),
  notes: z.string().optional(),
});

const searchTripSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  departureDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid departure date',
  }),
  seats: z.preprocess(
    (val) => val ? Number(val) : 1,
    z.number().min(1, 'At least 1 seat required').default(1)
  ),
});

const getTripByIdSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
});
// TripController
export class TripController {
  private tripService: TripService;

  constructor(tripService: TripService) {
    this.tripService = tripService;
  }

  public getDirections = asyncHandler(async (req: Request, res: Response) => {
    const { origin, destination, vehicle } = directionSchema.parse(req.query);

    const directions = await this.tripService.getDirections(
      origin,
      destination,
      vehicle
    );

    return res.status(HTTPSTATUS.OK).json({
      message: 'Directions retrieved successfully',
      data: directions,
    });
  });

  public getPlaceAutocomplete = asyncHandler(async (req: Request, res: Response) => {
    const { input } = autocompleteSchema.parse(req.query);

    const suggestions = await this.tripService.getPlaceAutocomplete(input);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Autocomplete suggestions retrieved successfully',
      data: suggestions,
    });
  });

  public getGeocode = asyncHandler(async (req: Request, res: Response) => {
    const { address } = geocodeSchema.parse(req.query);

    const geocode = await this.tripService.getGeocode(address);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Geocode retrieved successfully',
      data: geocode,
    });
  });

  public createTrip = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createTripSchema.parse(req.body);

    const userId = validatedData.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: 'Invalid userId',
        errorCode: 'INVALID_USER_ID',
      });
    }

    const trip = await this.tripService.createTrip({
      userId: userId,
      origin: validatedData.origin,
      destination: validatedData.destination,
      startTime: new Date(validatedData.startTime),
      endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
      availableSeats: validatedData.availableSeats,
      notes: validatedData.notes,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: 'Trip created successfully',
      data: trip,
    });
  });

  public searchTrips = asyncHandler(async (req: Request, res: Response) => {
    const { origin, destination, departureDate, seats } = searchTripSchema.parse(req.query);

    const trips = await this.tripService.searchTrips({
      origin,
      destination,
      departureDate,
      seats,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: 'Trips found successfully',
      data: trips,
    });
  });

  public getTripById = asyncHandler(async (req: Request, res: Response) => {
    const { tripId } = getTripByIdSchema.parse(req.params);

    const trip = await this.tripService.getTripById(tripId);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Trip retrieved successfully',
      data: trip,
    });
  });
}
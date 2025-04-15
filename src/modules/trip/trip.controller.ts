// src/modules/direction/search-direction.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { DirectionService } from './trip.service';
import { z } from 'zod';

const directionSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicle: z.enum(['car', 'bike', 'foot']).optional().default('car'),
});

const autocompleteSchema = z.object({
  input: z.string().min(1, 'Input is required'),
});

const geocodeSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

export class DirectionController {
  private directionService: DirectionService;

  constructor(directionService: DirectionService) {
    this.directionService = directionService;
  }

  public getDirections = asyncHandler(async (req: Request, res: Response) => {
    const { origin, destination, vehicle } = directionSchema.parse(req.query);

    const directions = await this.directionService.getDirections(
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

    const suggestions = await this.directionService.getPlaceAutocomplete(input);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Autocomplete suggestions retrieved successfully',
      data: suggestions,
    });
  });

  public getGeocode = asyncHandler(async (req: Request, res: Response) => {
    const { address } = geocodeSchema.parse(req.query);

    const geocode = await this.directionService.getGeocode(address);

    return res.status(HTTPSTATUS.OK).json({
      message: 'Geocode retrieved successfully',
      data: geocode,
    });
  });
}
import axios from 'axios';
import { config } from '../../config/app.config';
import { NotFoundException } from '../../common/utils/catch-errors';
import mongoose from 'mongoose';
import RouteTripModel, {
    RouteTripDocument,
} from '../../database/models/trip.model';
import { TripStatusEnum } from '../../common/enums/trip-status.enum';

export class TripService {
    public async getDirections(
        origin: string,
        destination: string,
        vehicle: string = 'car'
    ) {
        try {
            if (config.MAP_PROVIDER === 'gomaps') {
                return await this.getGoMapsDirections(
                    origin,
                    destination,
                    vehicle
                );
            } else {
                return await this.getGoongDirections(
                    origin,
                    destination,
                    vehicle
                );
            }
        } catch (error) {
            throw new NotFoundException(`Search not found`);
        }
    }

    private async getGoMapsDirections(
        origin: string,
        destination: string,
        mode: string
    ) {
        try {
            const response = await axios.get(
                'https://maps.gomaps.pro/maps/api/directions/json',
                {
                    params: {
                        origin,
                        destination,
                        key: config.GOMAPS_API_KEY,
                        mode,
                    },
                }
            );
            console.log('GoMaps API response:', response.data);
            return this.formatGoMapsResponse(response.data);
        } catch (error) {
            throw new NotFoundException(`Search not found`);
        }
    }

    private async getGoongDirections(
        origin: string,
        destination: string,
        vehicle: string
    ) {
        try {
            const response = await axios.get(
                'https://rsapi.goong.io/Direction',
                {
                    params: {
                        origin,
                        destination,
                        vehicle,
                        api_key: config.GOONG_API_KEY,
                    },
                }
            );
            return this.formatGoongResponse(response.data);
        } catch (error) {
            throw new NotFoundException(`Search not found`);
        }
    }

    public async getPlaceAutocomplete(input: string) {
        try {
            const response = await axios.get(
                'https://rsapi.goong.io/Place/AutoComplete',
                {
                    params: {
                        input,
                        api_key: config.GOONG_API_KEY,
                    },
                }
            );
            return this.formatAutocompleteResponse(response.data);
        } catch (error) {
            throw new NotFoundException('Autocomplete suggestions not found');
        }
    }

    public async getGeocode(address: string) {
        try {
            const response = await axios.get('https://rsapi.goong.io/geocode', {
                params: {
                    address,
                    api_key: config.GOONG_API_KEY,
                },
            });
            return this.formatGeocodeResponse(response.data, address);
        } catch (error) {
            throw new NotFoundException('Geocode not found');
        }
    }

    private formatGeocodeResponse(data: any, inputAddress: string) {
        if (!data.results || data.results.length === 0) {
            throw new NotFoundException('No geocode results found');
        }

        const normalizeAddress = (addr: string) =>
            addr.toLowerCase().replace(/\s+/g, ' ').trim().replace(/[,-]/g, '');

        const normalizedInput = normalizeAddress(inputAddress);

        const matchedResult =
            data.results.find((result: any) => {
                const normalizedFormattedAddress = normalizeAddress(
                    result.formatted_address
                );
                return normalizedFormattedAddress === normalizedInput;
            }) || data.results[0];

        if (!matchedResult) {
            throw new NotFoundException('No matching geocode result found');
        }

        return matchedResult;
    }

    private formatAutocompleteResponse(data: any) {
        return data;
    }

    private formatGoMapsResponse(data: any) {
        if (data.status !== 'OK') {
            throw new Error('No routes found from GoMaps');
        }
        return data;
    }

    private formatGoongResponse(data: any) {
        return data;
    }

    public async createTrip(data: CreateTripData): Promise<RouteTripDocument> {
        const {
            userId,
            origin,
            destination,
            startTime,
            endTime,
            availableSeats,
            notes,
        } = data;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new NotFoundException('Invalid userId');
        }

        try {
            const [originData, destinationData] = await Promise.all([
                this.getGeocode(origin),
                this.getGeocode(destination),
            ]);

            if (
                !originData?.geometry?.location ||
                !destinationData?.geometry?.location
            ) {
                throw new NotFoundException('Invalid geocode data');
            }

            const tripCode = await this.generateTripCode();

            const tripData: Partial<RouteTripDocument> = {
                userId: new mongoose.Types.ObjectId(userId),
                tripCode,
                startLocation: {
                    address: originData.formatted_address,
                    placeid: originData.place_id,
                    coordinates: {
                        lat: originData.geometry.location.lat,
                        lng: originData.geometry.location.lng,
                    },
                },
                endLocation: {
                    address: destinationData.formatted_address,
                    placeid: destinationData.place_id,
                    coordinates: {
                        lat: destinationData.geometry.location.lat,
                        lng: destinationData.geometry.location.lng,
                    },
                },
                schedule: {
                    startTime,
                    endTime,
                },
                availableSeats: availableSeats ?? 0,
                notes,
                status: TripStatusEnum.PENDING,
            };

            const trip = await RouteTripModel.create(tripData);
            return trip;
        } catch (error: any) {
            console.error('Error creating trip:', error);
            if (error.name === 'ValidationError') {
                throw new NotFoundException(
                    `Failed to create trip: ${error.message}`
                );
            }
            throw new NotFoundException(
                `Failed to create trip: ${error.message || 'Unknown error'}`
            );
        }
    }

    private async generateTripCode(): Promise<string> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = 5;
        const maxAttempts = 10;
        let attempts = 0;

        while (attempts < maxAttempts) {
            let tripCode = '';
            for (let i = 0; i < length; i++) {
                tripCode += characters.charAt(
                    Math.floor(Math.random() * characters.length)
                );
            }

            const existingTrip = await RouteTripModel.findOne({
                tripCode,
                isDeleted: false,
            });
            if (!existingTrip) {
                return tripCode;
            }

            attempts++;
        }

        throw new NotFoundException(
            'Unable to generate unique tripCode after multiple attempts'
        );
    }

    public async searchTrips(
        searchParams: SearchTripParams
    ): Promise<RouteTripDocument[]> {
        const { origin, destination, departureDate, seats } = searchParams;

        try {
            const [originData, destinationData] = await Promise.all([
                this.getGeocode(origin),
                this.getGeocode(destination),
            ]);

            if (
                !originData?.geometry?.location ||
                !destinationData?.geometry?.location
            ) {
                throw new NotFoundException('Invalid origin or destination');
            }

            const startDate = new Date(departureDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(departureDate);
            endDate.setHours(23, 59, 59, 999);

            const query: any = {
                'startLocation.address': {
                    $regex: originData.formatted_address,
                    $options: 'i',
                },
                'endLocation.address': {
                    $regex: destinationData.formatted_address,
                    $options: 'i',
                },
                'schedule.startTime': {
                    $gte: startDate,
                    $lte: endDate,
                },
                availableSeats: { $gte: seats || 1 },
                status: TripStatusEnum.PENDING,
                isDeleted: false,
            };

            const trips = await RouteTripModel.find(query)
                .sort({ 'schedule.startTime': 1 })
                .populate('userId', 'name phone avatar')
                .exec();

            if (trips.length === 0) {
                throw new NotFoundException(
                    'No trips found matching your criteria'
                );
            }

            return trips;
        } catch (error) {
            console.error('Error searching trips:', error);
            throw new NotFoundException('Failed to search trips');
        }
    }
}

import { TripController } from './trip.controller';
import { TripService } from './trip.service';

const tripService = new TripService();
const tripController = new TripController(tripService);

export { tripService, tripController };
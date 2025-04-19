// src/modules/direction/direction.routes.ts
import { Router } from 'express';
import { tripController } from './trip.module';
import { authenticateJWT } from '../../common/strategies/jwt.strategy';

const tripRoutes = Router();

tripRoutes.get('/search-direction',tripController.getDirections);
tripRoutes.get('/autocomplete', tripController.getPlaceAutocomplete);
tripRoutes.get('/geocode', tripController.getGeocode);
tripRoutes.post('/create-trip', tripController.createTrip);
tripRoutes.get('/search', tripController.searchTrips);
export default tripRoutes;
// src/modules/direction/direction.routes.ts
import { Router } from 'express';
import { directionController } from './trip.module';

const directionRoutes = Router();

directionRoutes.get('/search-direction',directionController.getDirections);
directionRoutes.get('/autocomplete', directionController.getPlaceAutocomplete);

export default directionRoutes;
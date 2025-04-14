// src/modules/direction/direction.module.ts
import { DirectionController } from './trip.controller';
import { DirectionService } from './trip.service';

const directionService = new DirectionService();
const directionController = new DirectionController(directionService);

export { directionService, directionController };
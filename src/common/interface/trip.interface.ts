interface CreateTripData {
    userId: string;
    origin: string;
    destination: string;
    startTime: Date;
    endTime?: Date;
    availableSeats?: number;
    notes?: string;
}

interface SearchTripParams {
    origin: string;
    destination: string;
    departureDate: string;
    seats?: number;
}

import axios from 'axios';
import { config } from '../../config/app.config';
import { NotFoundException } from '../../common/utils/catch-errors';

export class DirectionService {
  public async getDirections(
    origin: string, 
    destination: string, 
    vehicle: string = 'car'
  ) {
    try {
      if (config.MAP_PROVIDER === 'gomaps') {
        return await this.getGoMapsDirections(origin, destination, vehicle);
      } else {
        return await this.getGoongDirections(origin, destination, vehicle);
      }
    } catch (error) {
      throw new NotFoundException(`Search not found`);
    }
  }

  private async getGoMapsDirections(origin: string, destination: string, mode: string) {
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/directions/json', {
        params: {
          origin,
          destination,
          key: config.GOMAPS_API_KEY,
          mode,
        },
      });
      console.log('GoMaps API response:', response.data);
      return this.formatGoMapsResponse(response.data);
    } catch (error) {
      throw new NotFoundException(`Search not found`);
    }
  }

  

  private async getGoongDirections(origin: string, destination: string, vehicle: string) {
  try {
    const response = await axios.get('https://rsapi.goong.io/Direction', {
      params: {
        origin,
        destination,
        vehicle,
        api_key: config.GOONG_API_KEY,
      },
    });
    console.log('Goong API response:', response.data);
    return this.formatGoongResponse(response.data);
  } catch (error) {
    throw new NotFoundException(`Search not found`);
  }
}

public async getPlaceAutocomplete(input: string) {
  try {
    const response = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
      params: {
        input,
        api_key: config.GOONG_API_KEY,
      },
    });
    console.log('Goong Autocomplete API response:', response.data);
    return this.formatAutocompleteResponse(response.data);
  } catch (error) {
    console.error('Lỗi API Goong:', error);
    throw new NotFoundException('Autocomplete suggestions not found');
  }
}

  private formatAutocompleteResponse(data: any) {
    return data
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
}


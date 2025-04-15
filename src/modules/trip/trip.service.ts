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

    // Chuẩn hóa địa chỉ để so sánh (bỏ dấu cách thừa, chuyển về chữ thường)
    const normalizeAddress = (addr: string) =>
      addr
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[,-]/g, '');

    const normalizedInput = normalizeAddress(inputAddress);

    const matchedResult = data.results.find((result: any) => {
      const normalizedFormattedAddress = normalizeAddress(result.formatted_address);
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
}


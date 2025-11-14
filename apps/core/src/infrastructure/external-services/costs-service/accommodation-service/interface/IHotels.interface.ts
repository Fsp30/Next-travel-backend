export interface HotelInfo {
  hotelId: string;
  name: string;
  cityCode?: string;
  rating?: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

export interface HotelListResponse {
  data?: Array<{
    hotelId?: string;
    name?: string;
    cityCode?: string;
    rating?: string;
    geoCode?: {
      latitude?: number;
      longitude?: number;
    };
  }>;
}

export interface HotelOffersResponse {
  data?: Array<{
    hotel?: {
      hotelId?: string;
      name?: string;
    };
    offers?: Array<{
      id?: string;
      checkInDate?: string;
      checkOutDate?: string;
      price?: {
        currency?: string;
        total?: string;
      };
      room?: {
        typeEstimated?: {
          category?: string;
        };
      };
    }>;
  }>;
}

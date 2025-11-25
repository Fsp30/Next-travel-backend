export interface HotelInfo {
  hotelId: string;
  name: string;
  cityCode?: string;
  rating?: string;
  geoCode?: {
    latitude?: number;
    longitude?: number;
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

interface AmadeusHotelOffer {
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
}

export interface HotelWithOffers {
  hotel?: {
    hotelId?: string;
    name?: string;
  };
  offers?: AmadeusHotelOffer[];
}

export interface HotelOffersResponse {
  data?: HotelWithOffers[];
}

interface PriceRange {
  min: number;
  max: number;
}

export interface TotalCostsBreakdown {
  budget: PriceRange;
  midRange: PriceRange;
  luxury: PriceRange;
}

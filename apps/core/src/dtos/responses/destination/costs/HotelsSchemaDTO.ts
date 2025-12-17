import z from 'zod';

export const HotelInfoSchema = z.object({
  hotelId: z.string(),
  name: z.string(),
  cityCode: z.string().optional(),
  rating: z.string().optional(),
  geoCode: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
});

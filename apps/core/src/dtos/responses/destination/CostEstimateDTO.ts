import z from "zod";

export const TransportCostsDTOSchema = z.object({
        bus: z.object({
                min: z.number().optional(),
                max: z.number().optional(),
        }).optional(),
        flight: z.object({
                min: z.number().optional(),
                max: z.number().optional(),
        }).optional(),
        currency: z.string().default('BRL'),
})

export const AccomodationCostsDTOSchema = z.object({
        budget: z.object({
                min: z.number().optional(),
                max: z.number().optional(),
        }).optional(),
        midRange: z.object({
                min: z.number().optional(),
                max: z.number().optional(),
        }).optional(),
        luxury: z.object({
                min: z.number().optional(),
                max: z.number().optional(),
        }).optional(),
        currency: z.string().default('BRL')
})

export type TransportCostsDTO = z.infer<typeof TransportCostsDTOSchema>
export type AccomodationCostsDTO = z.infer<typeof AccomodationCostsDTOSchema>
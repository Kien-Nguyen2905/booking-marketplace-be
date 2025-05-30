import { HotelSchema } from 'src/shared/models/shared-hotel.model'
import { z } from 'zod'

export const GetHotelsResSchema = z.object({
  data: z.array(HotelSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetHotelResSchema = HotelSchema

export const GetHotelsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    orderBy: z.string().optional().default('createdAt'),
    status: z.string().optional(),
  })
  .strict()
export const CreateHotelBodySchema = HotelSchema.omit({
  id: true,
  reputationScore: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  status: true,
})
  .strict()
  .superRefine(({ vat }, ctx) => {
    if (vat < 0 || vat > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'VAT must be between 0 and 100',
        path: ['vat'],
      })
    }
  })

export const CreateHotelResSchema = HotelSchema

export const UpdateHotelBodySchema = HotelSchema.omit({
  createdAt: true,
  updatedAt: true,
})
  .strict()
  .superRefine(({ vat }, ctx) => {
    if (vat < 0 || vat > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'VAT must be between 0 and 100',
        path: ['vat'],
      })
    }
  })
export const UpdateHotelResSchema = HotelSchema
export type GetHotelsQueryType = z.infer<typeof GetHotelsQuerySchema>
export type GetHotelsResType = z.infer<typeof GetHotelsResSchema>
export type CreateHotelBodyType = z.infer<typeof CreateHotelBodySchema>
export type CreateHotelResType = z.infer<typeof CreateHotelResSchema>
export type GetHotelResType = z.infer<typeof GetHotelResSchema>
export type UpdateHotelBodyType = z.infer<typeof UpdateHotelBodySchema>
export type UpdateHotelResType = z.infer<typeof UpdateHotelResSchema>

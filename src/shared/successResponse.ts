import { z, ZodType } from 'zod'

export interface ApiResponse<T> {
  data: T
  message?: string
}

export function SuccessResponse<T>(data: T, message = 'Successful'): ApiResponse<T> {
  return { data, message }
}

export const ApiResponseSchema = <T extends ZodType>(dataSchema: T) =>
  z.object({
    message: z.string(),
    statusCode: z.number(),
    data: dataSchema,
  })

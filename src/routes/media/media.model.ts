import { z } from 'zod'

export const PresignedUploadFileBodySchema = z
  .object({
    filename: z.string(),
    filesize: z.number().max(3 * 1024 * 1024), // 3MB
  })
  .strict()

export const PresignedUploadFileResSchema = z.object({
  presignedUrl: z.string(),
  url: z.string(),
})

export const DeleteFilesBodySchema = z.object({
  oldFileKeys: z.array(z.string()),
})

export type DeleteFilesBodyType = z.infer<typeof DeleteFilesBodySchema>

export type PresignedUploadFileBodyType = z.infer<typeof PresignedUploadFileBodySchema>

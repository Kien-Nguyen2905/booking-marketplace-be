import { HTTPMethod } from 'src/shared/constants/role.constant'
import { z } from 'zod'

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().nullable(),
  path: z.string().max(1000),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  createdAt: z.date().nullable(),
})
export type PermissionType = z.infer<typeof PermissionSchema>

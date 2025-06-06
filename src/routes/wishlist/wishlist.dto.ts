import { createZodDto } from 'nestjs-zod'
import {
  CreateWishlistBodySchema,
  CreateWishlistResSchema,
  DeleteWishlistResSchema,
  GetWishlistsByUserIdResSchema,
} from 'src/routes/wishlist/wishlist.model'

export class GetWishlistsByUserIdResDTO extends createZodDto(GetWishlistsByUserIdResSchema) {}

export class CreateWishlistBodyDTO extends createZodDto(CreateWishlistBodySchema) {}
export class CreateWishlistResDTO extends createZodDto(CreateWishlistResSchema) {}

export class DeleteWishlistResDTO extends createZodDto(DeleteWishlistResSchema) {}

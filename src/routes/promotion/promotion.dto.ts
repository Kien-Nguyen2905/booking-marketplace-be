import { createZodDto } from 'nestjs-zod'
import {
  GetPromotionResSchema,
  GetPromotionsQuerySchema,
  GetPromotionsResSchema,
  CreatePromotionBodySchema,
  CreatePromotionResSchema,
  UpdatePromotionBodySchema,
  UpdatePromotionResSchema,
  DeletePromotionResSchema,
  GetPromotionByValidFromResSchema,
} from 'src/routes/promotion/promotion.model'

export class GetPromotionResDTO extends createZodDto(GetPromotionResSchema) {}

export class GetPromotionsQueryDTO extends createZodDto(GetPromotionsQuerySchema) {}

export class GetPromotionsResDTO extends createZodDto(GetPromotionsResSchema) {}

export class CreatePromotionBodyDTO extends createZodDto(CreatePromotionBodySchema) {}

export class CreatePromotionResDTO extends createZodDto(CreatePromotionResSchema) {}

export class UpdatePromotionBodyDTO extends createZodDto(UpdatePromotionBodySchema) {}

export class UpdatePromotionResDTO extends createZodDto(UpdatePromotionResSchema) {}

export class DeletePromotionResDTO extends createZodDto(DeletePromotionResSchema) {}

export class GetPromotionByValidFromResDTO extends createZodDto(GetPromotionByValidFromResSchema) {}

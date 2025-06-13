import { createZodDto } from 'nestjs-zod'
import {
  CreateCouponBodySchema,
  CreateCouponResSchema,
  UpdateCouponBodySchema,
  UpdateCouponResSchema,
  DeleteCouponResSchema,
  GetCouponsQuerySchema,
  GetCouponsResSchema,
  GetCouponResSchema,
  ValidateCouponBodySchema,
} from './coupon.model'

export class GetCouponsResDTO extends createZodDto(GetCouponsResSchema) {}
export class GetCouponsQueryDTO extends createZodDto(GetCouponsQuerySchema) {}

export class GetCouponResDTO extends createZodDto(GetCouponResSchema) {}

export class CreateCouponResDTO extends createZodDto(CreateCouponResSchema) {}
export class CreateCouponBodyDTO extends createZodDto(CreateCouponBodySchema) {}

export class UpdateCouponResDTO extends createZodDto(UpdateCouponResSchema) {}
export class UpdateCouponBodyDTO extends createZodDto(UpdateCouponBodySchema) {}

export class DeleteCouponResDTO extends createZodDto(DeleteCouponResSchema) {}

export class ValidateCouponBodyDTO extends createZodDto(ValidateCouponBodySchema) {}

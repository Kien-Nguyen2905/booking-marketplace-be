import { createZodDto } from 'nestjs-zod'
import {
  CreateOrderBodySchema,
  GetOrderByIdResSchema,
  GetOrdersByUserIdQuerySchema,
  GetOrdersByUserIdResSchema,
  GetOrdersQuerySchema,
  GetOrdersResSchema,
  UpdateOrderBodySchema,
  UpdateOrderResSchema,
} from 'src/routes/order/order.model'

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class GetOrderByIdResDTO extends createZodDto(GetOrderByIdResSchema) {}

export class GetOrdersQueryDTO extends createZodDto(GetOrdersQuerySchema) {}

export class GetOrdersResDTO extends createZodDto(GetOrdersResSchema) {}

export class GetOrdersByUserIdQueryDTO extends createZodDto(GetOrdersByUserIdQuerySchema) {}

export class GetOrdersByUserIdResDTO extends createZodDto(GetOrdersByUserIdResSchema) {}

export class UpdateOrderBodyDTO extends createZodDto(UpdateOrderBodySchema) {}

export class UpdateOrderResDTO extends createZodDto(UpdateOrderResSchema) {}

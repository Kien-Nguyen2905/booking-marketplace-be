import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common'
import { OrderService } from './order.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateOrderBodyDTO,
  ExportPartnerRevenueDTO,
  ExportPartnerRevenueResDTO,
  GetOrderByIdResDTO,
  GetOrdersByUserIdQueryDTO,
  GetOrdersByUserIdResDTO,
  GetOrdersQueryDTO,
  GetOrdersResDTO,
  UpdateOrderBodyDTO,
} from 'src/routes/order/order.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { OrderStatusType } from 'src/shared/constants/order.constant'

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodSerializerDto(GetOrdersResDTO)
  async list(@Query() query: GetOrdersQueryDTO) {
    return await this.orderService.list(query)
  }

  @Get('/me')
  @ZodSerializerDto(GetOrdersByUserIdResDTO)
  async listMyOrder(@Query() query: GetOrdersByUserIdQueryDTO, @ActiveUser('userId') userId: number) {
    return await this.orderService.listMyOrder(query, userId)
  }


  @Get('/export-partner-revenue')
  @ZodSerializerDto(ExportPartnerRevenueResDTO)
  async exportPartnerRevenue(@Query() query: ExportPartnerRevenueDTO) {
    return await this.orderService.exportPartnerRevenue(query)
  }

  @Get('/hotel/:hotelId')
  @ZodSerializerDto(GetOrdersResDTO)
  async listPartnerOrder(@Query() query: GetOrdersQueryDTO, @Param('hotelId') hotelId: string) {
    return await this.orderService.listPartnerOrder({ ...query, hotelId: +hotelId })
  }

  @Get(':id')
  @ZodSerializerDto(GetOrderByIdResDTO)
  async findById(@Param('id') id: string) {
    return await this.orderService.findById(+id)
  }

  @Post()
  @ZodSerializerDto(CreateOrderBodyDTO)
  async create(@Body() body: CreateOrderBodyDTO) {
    return await this.orderService.create(body)
  }

  @Put('status/me/:id')
  @ZodSerializerDto(UpdateOrderBodyDTO)
  async requestRefund(@Param('id') id: string, @Body() body: UpdateOrderBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.orderService.updateStatusOrderByUser({
      userId,
      orderId: +id,
      status: body.status as OrderStatusType,
      reason: body.reason || '',
    })
  }

  @Put('status/:id')
  @ZodSerializerDto(UpdateOrderBodyDTO)
  async update(@Param('id') id: string, @Body() body: UpdateOrderBodyDTO) {
    return await this.orderService.updateStatusOrder({
      orderId: +id,
      status: body.status as OrderStatusType,
      reason: body.reason || '',
    })
  }
}

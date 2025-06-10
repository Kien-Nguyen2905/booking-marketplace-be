import { Controller, Query, Param, Body, Post, Put, Delete, Get } from '@nestjs/common'
import { CouponService } from './coupon.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCouponBodyDTO,
  CreateCouponResDTO,
  DeleteCouponResDTO,
  GetCouponResDTO,
  GetCouponsResDTO,
  UpdateCouponBodyDTO,
  UpdateCouponResDTO,
} from 'src/routes/coupon/coupon.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetCouponsResDTO)
  async list(@Query() query: { limit: number; page: number; order: 'asc' | 'desc'; orderBy?: string }) {
    return await this.couponService.findMany({
      limit: +query.limit,
      page: +query.page,
      order: query.order,
      orderBy: query.orderBy,
    })
  }

  @Get(':id')
  @ZodSerializerDto(GetCouponResDTO)
  async find(@Param('id') id: string) {
    return await this.couponService.find(+id)
  }

  @Post()
  @ZodSerializerDto(CreateCouponResDTO)
  async create(@Body() body: CreateCouponBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.couponService.create({ data: body, createdById: userId })
  }

  @Put(':id')
  @ZodSerializerDto(UpdateCouponResDTO)
  async update(@Body() body: UpdateCouponBodyDTO, @Param('id') id: string) {
    return await this.couponService.update({ data: body, id: +id })
  }

  @Delete(':id')
  @ZodSerializerDto(DeleteCouponResDTO)
  async delete(@Param('id') id: string) {
    return await this.couponService.delete(+id)
  }
}

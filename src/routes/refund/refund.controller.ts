import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { RefundService } from './refund.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateRefundBodyDTO,
  CreateRefundResDTO,
  GetRefundResDTO,
  GetRefundsQueryDTO,
  GetRefundsResDTO,
} from 'src/routes/refund/refund.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Get()
  @ZodSerializerDto(GetRefundsResDTO)
  async list(@Query() query: GetRefundsQueryDTO) {
    return this.refundService.list(query)
  }

  @Get('/me')
  @ZodSerializerDto(GetRefundsResDTO)
  async getMyRefund(@Query() query: GetRefundsQueryDTO, @ActiveUser('userId') userId: number) {
    return this.refundService.listByUserId({ ...query, userId })
  }

  @Get(':id')
  @ZodSerializerDto(GetRefundResDTO)
  async findById(@Param('id') id: string) {
    return this.refundService.findById(+id)
  }

  @Post()
  @ZodSerializerDto(CreateRefundResDTO)
  async create(@Body() body: CreateRefundBodyDTO, @ActiveUser('userId') userId: number) {
    return this.refundService.create({ ...body, createdById: userId })
  }
}

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { PromotionService } from './promotion.service'
import {
  CreateNotifyPromotionBodyDTO,
  CreateNotifyPromotionResDTO,
  CreatePromotionBodyDTO,
  CreatePromotionResDTO,
  DeletePromotionResDTO,
  GetPromotionByValidFromResDTO,
  GetPromotionResDTO,
  GetPromotionsQueryDTO,
  GetPromotionsResDTO,
  UpdatePromotionBodyDTO,
  UpdatePromotionResDTO,
} from './promotion.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}
  @Get()
  @ZodSerializerDto(GetPromotionsResDTO)
  async getPromotions(@Query() query: GetPromotionsQueryDTO) {
    return await this.promotionService.getAllPromotions(query)
  }

  @Get('valid')
  @IsPublic()
  @ZodSerializerDto(GetPromotionByValidFromResDTO)
  async getPromotionByValidFrom(@Query('validFrom') validFrom: string, @Query('validUntil') validUntil?: string) {
    return await this.promotionService.findPromotionByValidFrom(validFrom, validUntil)
  }

  @Get(':id')
  @ZodSerializerDto(GetPromotionResDTO)
  async getPromotion(@Param('id') id: string) {
    return await this.promotionService.getPromotion(+id)
  }

  @Post()
  @ZodSerializerDto(CreatePromotionResDTO)
  async create(@Body() body: CreatePromotionBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.promotionService.createPromotion({ data: body, userId })
  }

  @Put(':id')
  @ZodSerializerDto(UpdatePromotionResDTO)
  async update(@Body() body: UpdatePromotionBodyDTO, @Param('id') id: string) {
    return await this.promotionService.updatePromotion({ data: body, id: +id })
  }

  @Delete(':id')
  @ZodSerializerDto(DeletePromotionResDTO)
  async delete(@Param('id') id: string) {
    return await this.promotionService.deletePromotion(+id)
  }

  @Post('notify')
  @ZodSerializerDto(CreateNotifyPromotionResDTO)
  async notifyToPartners(@Body() body: CreateNotifyPromotionBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.promotionService.notifyToPartners({ data: body, createdById: userId })
  }
}

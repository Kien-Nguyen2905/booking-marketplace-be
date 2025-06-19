import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateReviewBodyDTO,
  CreateReviewResDTO,
  GetReviewsQueryDTO,
  GetReviewsResDTO,
} from 'src/routes/review/review.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/hotel/:hotelId')
  @ZodSerializerDto(GetReviewsResDTO)
  async listByHotelId(@Query() query: GetReviewsQueryDTO, @Param('hotelId') hotelId: string) {
    return this.reviewService.listByHotelId({ ...query, hotelId: +hotelId })
  }

  @Post()
  @ZodSerializerDto(CreateReviewResDTO)
  async create(@Body() body: CreateReviewBodyDTO, @ActiveUser('userId') userId: number) {
    return this.reviewService.create({ ...body, userId })
  }
}

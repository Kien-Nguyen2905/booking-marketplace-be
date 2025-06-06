import { Controller, Body, Delete, Get, Param, Post } from '@nestjs/common'
import { WishlistService } from './wishlist.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateWishlistBodyDTO,
  CreateWishlistResDTO,
  DeleteWishlistResDTO,
  GetWishlistsByUserIdResDTO,
} from 'src/routes/wishlist/wishlist.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ZodSerializerDto(GetWishlistsByUserIdResDTO)
  async getWishlistsByUserId(@ActiveUser('userId') userId: number) {
    return await this.wishlistService.findWishlistByUserId(userId)
  }

  @Post()
  @ZodSerializerDto(CreateWishlistResDTO)
  async create(@Body() body: CreateWishlistBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.wishlistService.create({ data: body, userId })
  }

  @Delete('/:id')
  @ZodSerializerDto(DeleteWishlistResDTO)
  async delete(@Param('id') id: string) {
    return await this.wishlistService.delete(+id)
  }
}

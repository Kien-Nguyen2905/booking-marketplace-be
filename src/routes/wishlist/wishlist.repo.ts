import { Injectable } from '@nestjs/common'
import { CreateWishlistBodyType } from 'src/routes/wishlist/wishlist.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class WishlistRepo {
  constructor(private prismaService: PrismaService) {}

  async findWishlistByUserId(userId: number) {
    return await this.prismaService.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        hotel: true,
      },
    })
  }

  async create({ data, userId }: { data: CreateWishlistBodyType; userId: number }) {
    return await this.prismaService.wishlist.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  async delete(id: number) {
    return await this.prismaService.wishlist.delete({
      where: {
        id,
      },
    })
  }
}

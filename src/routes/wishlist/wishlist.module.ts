import { Module } from '@nestjs/common'
import { WishlistService } from './wishlist.service'
import { WishlistController } from './wishlist.controller'
import { WishlistRepo } from 'src/routes/wishlist/wishlist.repo'

@Module({
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepo],
})
export class WishlistModule {}

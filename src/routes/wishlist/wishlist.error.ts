import { BadRequestException } from '@nestjs/common'

export const WishlistAlreadyExistsException = new BadRequestException('Wishlist already exists')
export const WishlistNotFoundException = new BadRequestException('Wishlist not found')

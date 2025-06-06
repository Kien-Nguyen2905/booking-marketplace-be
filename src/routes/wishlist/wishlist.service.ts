import { Injectable } from '@nestjs/common'
import { WishlistRepo } from './wishlist.repo'
import { CreateWishlistBodyType } from 'src/routes/wishlist/wishlist.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { WishlistAlreadyExistsException, WishlistNotFoundException } from 'src/routes/wishlist/wishlist.error'

@Injectable()
export class WishlistService {
  constructor(private wishlistRepo: WishlistRepo) {}

  async findWishlistByUserId(userId: number) {
    try {
      return await this.wishlistRepo.findWishlistByUserId(userId)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw WishlistNotFoundException
      }
      throw error
    }
  }

  async create({ data, userId }: { data: CreateWishlistBodyType; userId: number }) {
    try {
      console.log(userId)
      return await this.wishlistRepo.create({ data, userId })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw WishlistAlreadyExistsException
      }
      throw error
    }
  }

  async delete(id: number) {
    try {
      return await this.wishlistRepo.delete(id)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw WishlistNotFoundException
      }
      throw error
    }
  }
}

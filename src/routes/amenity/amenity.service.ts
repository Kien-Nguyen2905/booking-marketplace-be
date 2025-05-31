import { Injectable } from '@nestjs/common'
import { AmenityRepo } from './amenity.repo'
import { CreateAmenityBodyType } from 'src/routes/amenity/amenity.model'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { AmenityAlreadyExistsException } from 'src/routes/amenity/amenity.error'

@Injectable()
export class AmenityService {
  constructor(private readonly amenityRepo: AmenityRepo) {}

  async list() {
    return await this.amenityRepo.list()
  }

  async create(data: CreateAmenityBodyType) {
    try {
      return await this.amenityRepo.create(data)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw AmenityAlreadyExistsException
      }
      throw error
    }
  }
}

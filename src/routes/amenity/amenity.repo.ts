import { Injectable } from '@nestjs/common'
import { CreateAmenityBodyType } from 'src/routes/amenity/amenity.model'
import { AMENITY_CATEGORY_TYPE } from 'src/shared/constants/amenity.constant'
import { capitalizeFirst } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class AmenityRepo {
  constructor(private prismaService: PrismaService) {}

  async list() {
    return await this.prismaService.amenity.findMany()
  }

  async create(data: CreateAmenityBodyType) {
    return await this.prismaService.amenity.create({
      data: { name: capitalizeFirst(data.name), category: data.category as AMENITY_CATEGORY_TYPE },
    })
  }
}

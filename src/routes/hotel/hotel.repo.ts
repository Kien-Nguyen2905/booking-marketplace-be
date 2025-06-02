import { Injectable } from '@nestjs/common'
import {
  CreateHotelAmenitiesBodyType,
  CreateHotelBodyType,
  GetHotelsQueryType,
  UpdateHotelAmenitiesBodyType,
  UpdateHotelBodyType,
} from 'src/routes/hotel/hotel.model'
import { HotelStatusType } from 'src/shared/constants/hotel.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { S3Service } from 'src/shared/services/s3.service'

@Injectable()
export class HotelRepo {
  constructor(
    private prismaService: PrismaService,
    private s3Service: S3Service,
  ) {}

  async list({ limit, page, search, status, order, orderBy }: GetHotelsQueryType) {
    const skip = (page - 1) * limit
    const take = limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.hotel.count({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
          status: status?.toUpperCase() as HotelStatusType,
        },
      }),
      this.prismaService.hotel.findMany({
        skip,
        take,
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
          status: status?.toUpperCase() as HotelStatusType,
        },
        orderBy: {
          [orderBy]: order,
        },
      }),
    ])
    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async create(data: CreateHotelBodyType) {
    return await this.prismaService.hotel.create({
      data: {
        ...data,
        vat: data.vat / 100,
      },
    })
  }

  async find(id: number) {
    return await this.prismaService.hotel.findUnique({ where: { id } })
  }

  async findByPartnerId(partnerId: number) {
    return await this.prismaService.hotel.findUnique({ where: { partnerId } })
  }

  async updateStatus({ data, hotelId }: { data: { status: HotelStatusType }; hotelId: number }) {
    return await this.prismaService.hotel.update({
      where: {
        id: hotelId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async update({ data, id }: { data: UpdateHotelBodyType; id: number }) {
    const hotel = await this.prismaService.hotel.findUnique({ where: { id } })
    const oldImages = hotel?.images?.filter((image) => !data.images.includes(image)) || []
    if (oldImages.length > 0) {
      await this.s3Service.deleteFiles(oldImages)
    }
    return await this.prismaService.hotel.update({
      where: {
        id,
      },
      data: {
        ...data,
        vat: data.vat / 100,
        updatedAt: new Date(),
      },
    })
  }

  async createAmenities({ data }: { data: CreateHotelAmenitiesBodyType }) {
    const hotelAmenities = data.amenities.map((amenityId) => ({
      hotelId: data.hotelId,
      amenityId,
    }))
    return await this.prismaService.hotelAmenity.createMany({
      data: hotelAmenities,
    })
  }

  async findAmenitiesByHotelId(hotelId: number) {
    const amenities = await this.prismaService.hotelAmenity.findMany({
      where: { hotelId },
      select: {
        amenity: true,
      },
    })
    return amenities.map((amenity) => amenity.amenity)
  }

  async updateAmenities({ data, hotelId }: { data: UpdateHotelAmenitiesBodyType; hotelId: number }) {
    // Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
    return await this.prismaService.$transaction(async (prisma) => {
      // Xóa tất cả các bản ghi HotelAmenity hiện có cho hotelId
      await prisma.hotelAmenity.deleteMany({
        where: { hotelId: hotelId },
      })

      // Tạo các bản ghi mới trong HotelAmenity
      const hotelAmenities = data.amenities.map((amenityId) => ({
        hotelId: hotelId,
        amenityId: amenityId,
      }))

      await prisma.hotelAmenity.createMany({
        data: hotelAmenities,
      })

      // Trả về danh sách Amenities mới được liên kết
      return await prisma.hotelAmenity.findMany({
        where: { hotelId: hotelId },
        include: { amenity: true },
      })
    })
  }
}

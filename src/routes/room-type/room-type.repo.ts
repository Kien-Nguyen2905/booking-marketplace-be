import { Injectable } from '@nestjs/common'
import {
  CreateRoomBedBodyType,
  CreateRoomTypeAmenitiesBodyType,
  CreateRoomTypeBodyType,
  UpdateRoomBedBodyType,
  UpdateRoomTypeAmenitiesBodyType,
  UpdateRoomTypeBodyType,
} from 'src/routes/room-type/room-type.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { S3Service } from 'src/shared/services/s3.service'

@Injectable()
export class RoomTypeRepo {
  constructor(
    private prismaService: PrismaService,
    private s3Service: S3Service,
  ) {}

  async findById(id: number) {
    const roomType = await this.prismaService.roomType.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        roomBed: true,
        roomTypeAmenity: {
          include: {
            amenity: true,
          },
        },
      },
    })

    const amenities = roomType?.roomTypeAmenity.map((roomTypeAmenity) => roomTypeAmenity.amenity) || []
    return {
      ...roomType,
      roomTypeAmenity: amenities,
    }
  }

  async findByHotelId(hotelId: number) {
    return await this.prismaService.roomType.findMany({
      where: {
        hotelId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async create(data: CreateRoomTypeBodyType) {
    return await this.prismaService.roomType.create({
      data: {
        ...data,
        serviceFeeRate: data.serviceFeeRate / 100,
      },
    })
  }

  async update(data: UpdateRoomTypeBodyType & { id: number }) {
    const roomType = await this.prismaService.roomType.findUnique({ where: { id: data.id } })
    const oldImages = roomType?.images?.filter((image) => !data.images.includes(image)) || []
    if (oldImages.length > 0) {
      await this.s3Service.deleteFiles(oldImages)
    }
    return await this.prismaService.roomType.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
        serviceFeeRate: data.serviceFeeRate / 100,
        updatedAt: new Date(),
      },
    })
  }

  async delete(id: number) {
    return await this.prismaService.roomType.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  async createRoomBed({ data, roomTypeId }: { data: CreateRoomBedBodyType; roomTypeId: number }) {
    const roomBeds = data.roomBeds.map((roomBed) => ({
      ...roomBed,
      roomTypeId,
    }))
    return await this.prismaService.roomBed.createMany({
      data: roomBeds,
    })
  }

  async updateRoomBed({ data, roomTypeId }: { data: UpdateRoomBedBodyType; roomTypeId: number }) {
    // Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
    return await this.prismaService.$transaction(async (prisma) => {
      // Xóa tất cả các bản ghi RoomBed hiện có cho roomTypeId

      await prisma.roomBed.deleteMany({
        where: { roomTypeId },
      })

      // Tạo các bản ghi mới trong RoomBed
      const roomBeds = data.roomBeds.map((roomBed) => ({
        ...roomBed,
        roomTypeId,
      }))

      await prisma.roomBed.createMany({
        data: roomBeds,
      })

      // Trả về danh sách RoomBed mới được liên kết
      return await prisma.roomBed.findMany({
        where: { roomTypeId },
      })
    })
  }

  async createRoomTypeAmenities({ data, roomTypeId }: { data: CreateRoomTypeAmenitiesBodyType; roomTypeId: number }) {
    // Tạo các bản ghi mới trong RoomTypeAmenity
    const roomTypeAmenities = data.amenities.map((amenityId) => ({
      roomTypeId,
      amenityId,
    }))
    return await this.prismaService.roomTypeAmenity.createMany({
      data: roomTypeAmenities,
    })
  }

  async updateRoomTypeAmenities({ data, roomTypeId }: { data: UpdateRoomTypeAmenitiesBodyType; roomTypeId: number }) {
    // Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
    return await this.prismaService.$transaction(async (prisma) => {
      // Xóa tất cả các bản ghi RoomTypeAmenity hiện có cho roomTypeId
      await prisma.roomTypeAmenity.deleteMany({
        where: { roomTypeId },
      })

      // Tạo các bản ghi mới trong RoomTypeAmenity
      const roomAmenities = data.amenities.map((amenityId) => ({
        roomTypeId,
        amenityId,
      }))

      await prisma.roomTypeAmenity.createMany({
        data: roomAmenities,
      })

      // Trả về danh sách RoomTypeAmenity mới được liên kết
      const amenities = await prisma.roomTypeAmenity.findMany({
        where: { roomTypeId: roomTypeId },
        include: {
          amenity: true,
        },
      })
      return amenities.map((amenity) => amenity.amenity)
    })
  }
}

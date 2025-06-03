import { Injectable } from '@nestjs/common'
import { CreateRoomBodyType } from 'src/routes/room/room.model'
import { POLICY_TYPE, PolicyType } from 'src/shared/constants/room.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RoomRepo {
  constructor(private prismaService: PrismaService) {}

  async findRoomByRoomTypeId(roomTypeId: number) {
    return await this.prismaService.room.findMany({
      where: {
        roomTypeId,
        deletedAt: null,
      },
    })
  }

  async findById(id: number) {
    return await this.prismaService.room.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  async findRoomsByHotelId(hotelId: number) {
    const rooms = await this.prismaService.room.findMany({
      where: {
        hotelId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        roomType: {
          include: {
            roomBed: true,
            roomTypeAmenity: {
              include: {
                amenity: true,
              },
            },
          },
        },
      },
    })

    return rooms.map((room) => ({
      ...room,
      roomType: {
        ...room.roomType,
        roomTypeAmenity: room.roomType.roomTypeAmenity.map((item) => item.amenity),
      },
    }))
  }

  async create(data: CreateRoomBodyType) {
    return await this.prismaService.room.create({
      data: {
        ...data,
        policy: data.policy as PolicyType,
      },
    })
  }

  async update({ data, id }: { data: CreateRoomBodyType; id: number }) {
    return await this.prismaService.room.update({
      where: {
        id,
      },
      data: {
        ...data,
        rangeLimitDate: data.policy === POLICY_TYPE.FREE_CANCELLATION ? data.rangeLimitDate : 0,
        policy: data.policy as PolicyType,
        updatedAt: new Date(),
      },
    })
  }

  async delete(id: number) {
    return await this.prismaService.room.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }
}

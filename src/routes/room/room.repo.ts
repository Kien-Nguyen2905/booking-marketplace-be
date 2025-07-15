import { Injectable } from '@nestjs/common'
import { eachDayOfInterval, format, parse, subDays } from 'date-fns'
import { ConflictRoomAvailabilityException } from 'src/routes/order/order.error'
import { RoomNotFoundException } from 'src/routes/room/room.error'
import { CreateRoomBodyType } from 'src/routes/room/room.model'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { POLICY_TYPE, PolicyType } from 'src/shared/constants/room.constant'
import { toStartOfUTCDate } from 'src/shared/helpers'
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

  async findRoomIncludeOrderPending(id: number) {
    return await this.prismaService.room.findUnique({
      where: {
        id,
        deletedAt: null,
        order: {
          some: {
            status: ORDER_STATUS.PENDING,
          },
        },
      },
    })
  }

  async findRoomIncludeOrderConfirm(id: number) {
    return await this.prismaService.room.findUnique({
      where: {
        id,
        deletedAt: null,
        order: {
          some: {
            status: ORDER_STATUS.CONFIRMED,
          },
        },
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
    const room = await this.prismaService.$transaction(async (tx) => {
      const roomAvailabilities = await tx.roomAvailability.findMany({
        where: {
          roomId: id,
          totalRooms: {
            not: data.quantity,
          },
        },
      })
      for (const availability of roomAvailabilities) {
        const oldTotalRooms = availability.totalRooms
        const oldAvailableRooms = availability.availableRooms
        let newAvailableRooms

        if (data.quantity < oldTotalRooms) {
          // decrease quantity
          newAvailableRooms = oldAvailableRooms - (oldTotalRooms - data.quantity)
        } else {
          // increase quantity
          newAvailableRooms = oldAvailableRooms + Math.abs(oldTotalRooms - data.quantity)
        }

        const updateResult = await tx.roomAvailability.update({
          where: { id: availability.id },
          data: {
            totalRooms: data.quantity,
            availableRooms: Math.max(0, newAvailableRooms),
            version: { increment: 1 },
          },
        })
        if (updateResult === null) {
          throw ConflictRoomAvailabilityException
        }
      }
      return await tx.room.update({
        where: {
          id,
        },
        data: {
          ...data,
          rangeLimitDate: data.policy === POLICY_TYPE.PAY_AT_HOTEL ? data.rangeLimitDate : 0,
          policy: data.policy as PolicyType,
          updatedAt: new Date(),
        },
      })
    })
    return room
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

  async findAvailableRoomsByRoomId(roomId: number, start: string, end: string) {
    // Chuyển đổi ngày từ DD-MM-YYYY sang Date
    const startDateParsed = parse(start, 'dd-MM-yyyy', new Date())
    const endDateParsed = parse(end, 'dd-MM-yyyy', new Date())
    const startDate = toStartOfUTCDate(startDateParsed)
    const endDate = toStartOfUTCDate(endDateParsed)

    const room = await this.prismaService.room.findUnique({
      where: { id: roomId, deletedAt: null },
    })

    if (!room) {
      throw RoomNotFoundException
    }

    const dateRange = eachDayOfInterval({
      start: startDate,
      end: subDays(endDate, 1),
    })

    const roomAvailabilities = await this.prismaService.roomAvailability.findMany({
      where: {
        roomId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        createdAt: true,
        availableRooms: true,
      },
    })

    // Tạo map từ ngày sang số phòng trống
    const availabilityMap = new Map<string, number>()

    roomAvailabilities.forEach((ra) => {
      const dateStr = format(ra.createdAt!, 'yyyy-MM-dd')
      availabilityMap.set(dateStr, ra.availableRooms)
    })

    // Tìm số phòng trống tối thiểu trong khoảng thời gian
    let minAvailableRooms = room.quantity
    for (const date of dateRange) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const availableRooms = availabilityMap.has(dateStr) ? availabilityMap.get(dateStr)! : room.quantity
      minAvailableRooms = Math.min(minAvailableRooms, availableRooms)
    }

    return { ...room, availableRooms: minAvailableRooms }
  }
}

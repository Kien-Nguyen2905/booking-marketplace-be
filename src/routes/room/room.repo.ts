import { Injectable } from '@nestjs/common'
import { eachDayOfInterval, format, isValid, parse } from 'date-fns'
import { RoomNotFoundException } from 'src/routes/room/room.error'
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

  async findAvailableRoomsByRoomId(roomId: number, start: string, end: string) {
    // Chuyển đổi chuỗi ngày sang Date ISO string
    const startDate = parse(start, 'dd-MM-yyyy', new Date())
    const endDate = parse(end, 'dd-MM-yyyy', new Date())

    // Kiểm tra tính hợp lệ của ngày
    if (!isValid(startDate) || !isValid(endDate) || startDate > endDate) {
      throw new Error('Invalid date range')
    }

    // Lấy thông tin phòng từ database
    const room = await this.prismaService.room.findUnique({
      where: { id: roomId, deletedAt: null },
    })

    if (!room) {
      throw RoomNotFoundException
    }
    // Lấy danh sách tất cả các ngày trong khoảng thời gian
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
    // Lấy dữ liệu RoomAvailability trong khoảng thời gian
    const roomAvailabilities = await this.prismaService.roomAvailability.findMany({
      where: {
        roomId,
        createdAt: {
          gte: startDate,
          lte: endDate,
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

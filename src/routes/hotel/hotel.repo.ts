import { Injectable } from '@nestjs/common'
import { eachDayOfInterval, parse, subDays } from 'date-fns'
import {
  CreateHotelAmenitiesBodyType,
  CreateHotelBodyType,
  GetHotelsQueryType,
  UpdateHotelAmenitiesBodyType,
  UpdateHotelBodyType,
} from 'src/routes/hotel/hotel.model'
import { HotelStatus, HotelStatusType, HotelTypeType } from 'src/shared/constants/hotel.constant'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { toStartOfUTCDate } from 'src/shared/helpers'
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
    const hotel = await this.prismaService.hotel.findUnique({
      where: {
        id,
        roomType: {
          some: {
            deletedAt: null,
            room: {
              some: {
                deletedAt: null,
              },
            },
          },
        },
      },
      include: {
        hotelAmenity: {
          select: {
            amenity: true,
          },
        },
        roomType: {
          select: {
            id: true,
            hotelId: true,
            adults: true,
            child: true,
            images: true,
            area: true,
            description: true,
            serviceFeeRate: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            room: {
              orderBy: {
                price: 'asc',
              },
            },
            roomBed: true,
            roomTypeAmenity: {
              select: {
                amenity: true,
              },
            },
          },
        },
      },
    })
    hotel?.roomType?.sort((a, b) => {
      const priceA = a.room?.[0]?.price ?? Infinity
      const priceB = b.room?.[0]?.price ?? Infinity
      return priceA - priceB
    })
    const amenities = hotel?.roomType?.map((roomType) =>
      roomType.roomTypeAmenity.map((roomTypeAmenity) => roomTypeAmenity.amenity),
    )
    return {
      ...hotel,
      amenities,
      roomTypeAmenity: undefined,
    }
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

  async findHotelsByProvinceCode(provinceCode: number) {
    return await this.prismaService.hotel.findMany({
      where: {
        provinceCode,
        status: 'ACTIVE',
        roomType: {
          some: {
            deletedAt: null, // Chỉ lấy roomType chưa bị xóa
            room: {
              some: {
                deletedAt: null, // Chỉ lấy room chưa bị xóa
                quantity: {
                  gte: 1,
                },
              },
            },
          },
        },
      },
      include: {
        room: {
          where: {
            deletedAt: null,
            quantity: {
              gte: 1,
            },
          },
          include: {
            roomType: true,
          },
          orderBy: {
            price: 'asc',
          },
          take: 1,
        },
      },
      take: 7,
      orderBy: {
        reputationScore: 'desc',
      },
    })
  }

  async countHotel(provinceCodes: number[]) {
    // Kiểm tra đầu vào
    if (!provinceCodes || provinceCodes.length === 0) {
      return []
    }

    // Truy vấn đếm khách sạn cho từng provinceCode
    const results = await this.prismaService.hotel.groupBy({
      by: ['provinceCode'],
      where: {
        provinceCode: {
          in: provinceCodes,
        },
        status: 'ACTIVE',
        roomType: {
          some: {
            deletedAt: null,
            room: {
              some: {
                deletedAt: null,
              },
            },
          },
        },
      },
      _count: {
        id: true,
      },
    })

    // Định dạng kết quả thành mảng
    const countArray = provinceCodes.map((code) => ({
      provinceCode: code,
      quantity: results.find((result) => result.provinceCode === code)?._count.id || 0,
    }))

    return countArray
  }

  async findHotels(query: {
    province: number
    start: string // DD-MM-YYYY
    end: string // DD-MM-YYYY
    adult: number
    child?: number
    available: number
    page: number
    limit: number
    rating?: number
    type?: string
    orderBy?: string // 'rating', 'reputationScore', 'price'
    order?: 'asc' | 'desc' // Thứ tự sắp xếp
  }) {
    const {
      province,
      start,
      end,
      adult,
      child = 0,
      available,
      page,
      limit,
      rating,
      type,
      orderBy = 'reputationScore',
      order = 'desc',
    } = query
    const skip = (page - 1) * limit
    const take = limit

    // Chuyển đổi chuỗi ngày từ DD-MM-YYYY sang Date
    const startDateParsed = parse(start, 'dd-MM-yyyy', new Date())
    const endDateParsed = parse(end, 'dd-MM-yyyy', new Date())
    const startDate = toStartOfUTCDate(startDateParsed)
    const endDate = toStartOfUTCDate(endDateParsed)

    const dateRange = eachDayOfInterval({
      start: startDate,
      end: subDays(endDate, 1),
    })

    // Validate orderBy
    const validOrderByFields = ['rating', 'reputationScore', 'createdAt', 'price']
    const finalOrderBy = validOrderByFields.includes(orderBy) ? orderBy : 'reputationScore'

    // Truy vấn hotel (bỏ skip và take để lấy toàn bộ)
    const hotels = await this.prismaService.hotel.findMany({
      where: {
        provinceCode: province,
        status: HotelStatus.ACTIVE,
        ...(rating ? { rating: { equals: Number(rating) } } : {}),
        ...(type ? { type: type.toUpperCase() as HotelTypeType } : {}),
        roomType: {
          some: {
            deletedAt: null,
            adults: { equals: adult },
            child: { equals: child },
            room: {
              some: {
                deletedAt: null,
                quantity: { gte: available },
              },
            },
          },
        },
      },
      include: {
        hotelAmenity: {
          select: {
            amenity: true,
          },
        },
        roomType: {
          where: {
            deletedAt: null,
            adults: { gte: adult },
            child: child === 0 ? undefined : { gte: child },
          },
          include: {
            room: {
              where: {
                deletedAt: null,
                quantity: { gte: available },
              },
              include: {
                roomAvailability: {
                  where: {
                    createdAt: {
                      gte: startDate,
                      lt: endDate,
                    },
                  },
                },
              },
            },
            roomBed: true,
          },
        },
        room: {
          where: {
            deletedAt: null,
            quantity: { gte: available },
            roomType: {
              deletedAt: null,
              adults: { gte: adult },
              child: child === 0 ? undefined : { gte: child },
            },
          },
          include: {
            roomType: {
              select: {
                id: true,
                type: true,
                adults: true,
                child: true,
                area: true,
                serviceFeeRate: true,
                description: true,
                images: true,
              },
            },
          },
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
      orderBy: finalOrderBy !== 'price' ? { [finalOrderBy]: order } : undefined,
    })

    const isRoomAvailable = (room: any, dateRange: Date[], available: number): boolean => {
      for (const date of dateRange) {
        const availability = room.roomAvailability.find(
          (avail: any) => avail?.createdAt?.toDateString() === date.toDateString(),
        )
        const availableRooms = availability ? availability.availableRooms : room.quantity
        if (availableRooms < available) {
          return false
        }
      }
      return true
    }

    const filterRoomTypes = (roomType: any, dateRange: Date[], available: number): any | null => {
      // Sử dụng find để lấy phòng đầu tiên thỏa mãn trong số tất cả phòng thuộc roomType
      const firstAvailableRoom = roomType.room.find((room: any) => isRoomAvailable(room, dateRange, available))
      // Nếu không có phòng thỏa mãn, trả về null
      if (!firstAvailableRoom) return null
      return {
        ...roomType,
        room: [firstAvailableRoom], // Chỉ giữ phòng đầu tiên thỏa mãn
      }
    }

    const filterHotels = (hotel: any, dateRange: Date[], available: number): any | null => {
      const filteredRoomTypes = hotel.roomType
        .map((roomType: any) => filterRoomTypes(roomType, dateRange, available))
        // Loại bỏ các roomType trả về null
        .filter((roomType: any) => roomType !== null)
      if (filteredRoomTypes.length === 0) return null
      return {
        ...hotel,
        roomType: filteredRoomTypes,
      }
    }

    // Lọc hotel dựa theo khoảng ngày và số phòng trống
    let filteredHotels = hotels
      .map((hotel) => filterHotels(hotel, dateRange, available))
      // Loại bỏ các hotel trả về null
      .filter((hotel) => hotel !== null)

    //  orderBy là 'price' follow the price of the first room
    if (finalOrderBy === 'price') {
      filteredHotels.sort((a, b) => {
        const aPrice = a.room[0]?.price ?? Infinity
        const bPrice = b.room[0]?.price ?? Infinity
        return order === 'asc' ? aPrice - bPrice : bPrice - aPrice
      })
    }

    // totalItems và totalPages
    const totalItems = filteredHotels.length
    const totalPages = Math.ceil(totalItems / limit)
    const paginatedHotels = filteredHotels.slice(skip, skip + take)

    return {
      data: paginatedHotels,
      totalItems,
      page,
      limit,
      totalPages,
    }
  }

  async findHotelIncludeOrderPending(id: number) {
    return await this.prismaService.hotel.findUnique({
      where: {
        id,
      },
      include: {
        order: {
          where: {
            status: ORDER_STATUS.PENDING,
          },
        },
      },
    })
  }
}

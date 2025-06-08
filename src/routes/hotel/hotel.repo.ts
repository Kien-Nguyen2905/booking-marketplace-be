import { Injectable } from '@nestjs/common'
import { eachDayOfInterval, isValid, parse } from 'date-fns'
import {
  CreateHotelAmenitiesBodyType,
  CreateHotelBodyType,
  GetHotelsQueryType,
  UpdateHotelAmenitiesBodyType,
  UpdateHotelBodyType,
} from 'src/routes/hotel/hotel.model'
import { HotelStatusType, HotelTypeType } from 'src/shared/constants/hotel.constant'
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
    return await this.prismaService.hotel.findUnique({
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
            room: true,
            roomBed: true,
            roomTypeAmenity: {
              select: {
                amenity: true,
              },
            },
          },
        },
        review: true,
      },
    })
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
              },
            },
          },
        },
      },
      include: {
        room: {
          where: {
            deletedAt: null,
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
    amenity?: string // Ví dụ: '1' hoặc '1,2,3'
    orderBy?: string // 'rating', 'reputationScore', 'price'
    order?: 'asc' | 'desc' // Thứ tự sắp xếp
  }): Promise<{
    data: any[]
    totalItems: number
    page: number
    limit: number
    totalPages: number
  }> {
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
      amenity,
      orderBy = 'reputationScore',
      order = 'desc',
    } = query
    // Tính skip và take cho phân trang
    const skip = (page - 1) * limit
    const take = limit

    // Chuyển đổi ngày từ DD-MM-YYYY sang Date
    const startDate = parse(start, 'dd-MM-yyyy', new Date())
    const endDate = parse(end, 'dd-MM-yyyy', new Date())

    if (!isValid(startDate) || !isValid(endDate) || startDate >= endDate) {
      throw new Error('Invalid date range')
    }

    // Lấy tất cả các ngày trong khoảng thời gian
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

    // Kiểm tra tính hợp lệ của orderBy
    const validOrderByFields = ['rating', 'reputationScore', 'createdAt', 'price']
    const finalOrderBy = validOrderByFields.includes(orderBy) ? orderBy : 'reputationScore'
    const amenityArray = amenity
      ? amenity
          .split(',')
          .map(Number)
          .filter((n) => !isNaN(n))
      : []

    // Truy vấn khách sạn (bỏ skip và take để lấy toàn bộ)
    const hotels = await this.prismaService.hotel.findMany({
      where: {
        provinceCode: province,
        status: 'ACTIVE',
        ...(rating ? { rating: { equals: Number(rating) } } : {}),
        ...(type ? { type: type.toUpperCase() as HotelTypeType } : {}),
        ...(amenityArray.length > 0
          ? {
              hotelAmenity: {
                some: {
                  amenityId: { in: amenityArray },
                },
              },
            }
          : {}),
        roomType: {
          some: {
            deletedAt: null,
            adults: { gte: adult },
            child: child === 0 ? undefined : { gte: child },
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
          where: {
            deletedAt: null,
            adults: { gte: adult },
            child: child === 0 ? undefined : { gte: child },
          },
          include: {
            room: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                price: 'asc',
              },
              include: {
                roomAvailability: {
                  where: {
                    createdAt: {
                      gte: startDate,
                      lte: endDate,
                    },
                  },
                },
              },
            },
            roomBed: true,
          },
        },
      },
      orderBy: finalOrderBy !== 'price' ? { [finalOrderBy]: order } : undefined,
    })
    // Hàm kiểm tra phòng trống
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

    // Hàm lọc các roomType
    const filterRoomTypes = (roomType: any, dateRange: Date[], available: number): any | null => {
      // Sử dụng find để lấy phòng đầu tiên thỏa mãn
      const firstAvailableRoom = roomType.room.find((room: any) => isRoomAvailable(room, dateRange, available))
      if (!firstAvailableRoom) return null
      return {
        ...roomType,
        room: [firstAvailableRoom], // Chỉ giữ phòng đầu tiên thỏa mãn
      }
    }

    // Hàm lọc các khách sạn
    const filterHotels = (hotel: any, dateRange: Date[], available: number): any | null => {
      const filteredRoomTypes = hotel.roomType
        .map((roomType: any) => filterRoomTypes(roomType, dateRange, available))
        .filter((roomType: any) => roomType !== null)
      if (filteredRoomTypes.length === 0) return null
      return {
        ...hotel,
        roomType: filteredRoomTypes,
      }
    }

    // Lọc khách sạn dựa trên số phòng trống
    let filteredHotels = hotels
      .map((hotel) => filterHotels(hotel, dateRange, available))
      .filter((hotel) => hotel !== null)

    // Post-processing: Filter hotels that have all required amenities
    if (amenityArray.length > 0) {
      filteredHotels = filteredHotels.filter((hotel) => {
        // Get all amenity IDs for this hotel
        const hotelAmenityIds = hotel.hotelAmenity.map((item) => item.amenity.id)
        // Check if all required amenities are present
        return amenityArray.every((amenityId) => hotelAmenityIds.includes(Number(amenityId)))
      })
    }

    // Nếu orderBy là 'price', sắp xếp khách sạn theo giá phòng đầu tiên
    if (finalOrderBy === 'price') {
      const filteredHotelsPrice = filteredHotels.map((hotel) => {
        const price = hotel.roomType.sort((a, b) => a.room[0].price - b.room[0].price)[0]?.room[0]?.price ?? Infinity
        return {
          ...hotel,
          price,
        }
      })
      filteredHotels = filteredHotelsPrice.sort((a, b) => {
        return order === 'asc' ? a.price - b.price : b.price - a.price
      })
    }

    // Tính totalItems và totalPages
    const totalItems = filteredHotels.length
    const totalPages = Math.ceil(totalItems / limit)
    // Áp dụng phân trang
    const paginatedHotels = filteredHotels.slice(skip, skip + take)

    return {
      data: paginatedHotels,
      totalItems,
      page,
      limit,
      totalPages,
    }
  }
}

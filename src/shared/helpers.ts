import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'
import { UAParser } from 'ua-parser-js'
import path from 'path'

// Unique constraint violation
// Ý nghĩa: Lỗi P2002 xảy ra khi bạn cố gắng tạo hoặc cập nhật một bản ghi trong cơ sở dữ liệu,
// nhưng dữ liệu vi phạm một ràng buộc duy nhất (UNIQUE) được định nghĩa trong schema của bảng.
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

// Not found
// Ý nghĩa: Lỗi P2025 xảy ra khi bạn cố gắng thực hiện một thao tác (như cập nhật, xóa, hoặc truy vấn một bản ghi)
// yêu cầu một bản ghi cụ thể tồn tại trong cơ sở dữ liệu, nhưng bản ghi đó không được tìm thấy.
// Thông thường, lỗi này xuất hiện khi bạn sử dụng các phương thức như findUnique, update, delete, hoặc các thao tác liên quan đến quan hệ, nhưng bản ghi với điều kiện được chỉ định không tồn tại.

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

// Foreign key constraint violation
// Ý nghĩa: Lỗi P2003 xảy ra khi bạn cố gắng thực hiện một thao tác (như tạo hoặc cập nhật bản ghi)
// liên quan đến một trường khóa ngoại, nhưng giá trị của trường đó không hợp lệ hoặc không tồn tại trong bảng liên quan.
export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003'
}

export const generateOTP = () => {
  return String(randomInt(100000, 1000000))
}

export const extractDeviceInfo = (
  userAgent: string,
): {
  browser: string
  os: string
  deviceType: string
} => {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  // Lấy thông tin trình duyệt
  const browser = result.browser.name ? `${result.browser.name} ${result.browser.version || ''}` : 'Unknown'

  // Lấy thông tin hệ điều hành
  const os = result.os.name ? `${result.os.name} ${result.os.version || ''}` : 'Unknown'

  // Lấy hoặc suy ra loại thiết bị
  let deviceType = result.device.type || 'Unknown'

  // Nếu deviceType là 'Unknown', suy ra từ chuỗi UserAgent
  if (deviceType === 'Unknown') {
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/Tablet/i.test(userAgent)) {
      deviceType = 'tablet'
    } else if (/Windows|Macintosh|Linux/i.test(userAgent)) {
      deviceType = 'desktop'
    }
  }

  return {
    browser,
    os,
    deviceType,
  }
}

export const generateRandomFilename = (filename: string) => {
  const ext = path.extname(filename)
  return `${Date.now() + '-' + Math.round(Math.random() * 1e9)}${ext}`
}

export const capitalizeFirst = (input: string): string => {
  const trimmed = input.trim().toLowerCase()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

// Loại bỏ giờ chỉ lấy ngày
export const toStartOfUTCDate = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export const generateCancelPaymentJobId = (paymentId: number) => {
  return `paymentId-${paymentId}`
}

export const generateRoomUserId = (userId: number) => {
  return `userId-${userId}`
}

export const generateRoomPartnerId = (partnerId: number) => {
  return `partnerId-${partnerId}`
}

export const generateRoomPartnerToAdmin = () => {
  return `roomPartnerToAdmin`
}

export const generateRoomAdminToPartner = () => {
  return `roomAdminToPartner`
}

export const generateRoomAdmin = () => {
  return `roomAdmin`
}

export const generateCouponCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const getNowUTC7 = (): Date => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))

export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  const R = 6371 // Earth's radius in kilometers

  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in kilometers
}

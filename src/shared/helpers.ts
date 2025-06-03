import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'
import { UAParser } from 'ua-parser-js'
import path from 'path'
// Type Predicate

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
  const browser = result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Unknown'
  const os = result.os.name ? `${result.os.name} ${result.os.version}` : 'Unknown'
  const deviceType = result.device.type ? result.device.type : 'Unknown'
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

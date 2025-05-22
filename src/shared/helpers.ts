import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'
import { UAParser } from 'ua-parser-js'
import path from 'path'
// Type Predicate
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

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
  const browser = `${result.browser.name} ${result.browser.version}` || 'Unknown'
  const os = `${result.os.name} ${result.os.version}` || 'Unknown'
  const deviceType = result.device.type || 'Unknown'
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

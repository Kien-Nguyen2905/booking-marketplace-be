import z from 'zod'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Log NODE_ENV
console.log('NODE_ENV:', process.env.NODE_ENV)

// Determine the environment file - with more robust check
const isProd = process.env.NODE_ENV?.trim().toLowerCase() === 'production'
const envFile = isProd ? '.env.production' : '.env'
console.log('envFile:', envFile)

// Resolve the full path
const envFilePath = path.resolve(envFile)
console.log('envFilePath:', envFilePath)

// Check if the file exists
if (!fs.existsSync(envFilePath)) {
  console.log(`Not found file ${envFile}`)
  process.exit(1)
}

// Load the environment file with error handling
try {
  const result = config({ path: envFilePath, override: true })
  if (result.error) {
    console.error(`Failed to load ${envFile}:`, result.error)
    process.exit(1)
  }
} catch (error) {
  console.error(`Error loading ${envFile}:`, error)
  process.exit(1)
}

// Log loaded environment variables
console.log('Loaded PORT:', process.env.PORT)

// Zod schema
const configSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
  OTP_EXPIRES_IN: z.string(),
  OTP_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_CLIENT_REDIRECT_URI: z.string(),
  APP_NAME: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
})

// Validate environment variables
const configServer = configSchema.safeParse(process.env)

console.log(configServer)

if (!configServer.success) {
  console.log(`The variable values in file ${envFile} are invalid`)
  console.error(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data

// Log application status
console.log(`Running in ${process.env.NODE_ENV} mode`)
console.log(`Port: ${envConfig.PORT}`)

export default envConfig

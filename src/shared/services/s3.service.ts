import { DeleteObjectsCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import envConfig from 'src/shared/config'
import mime from 'mime-types'

@Injectable()
export class S3Service {
  private s3: S3

  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        secretAccessKey: envConfig.S3_SECRET_KEY,
        accessKeyId: envConfig.S3_ACCESS_KEY,
      },
    })
  }

  uploadedFile({ filename, filepath, contentType }: { filename: string; filepath: string; contentType: string }) {
    const parallelUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: filename,
        Body: readFileSync(filepath),
        ContentType: contentType,
      },
      tags: [],
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    })
    return parallelUploads3.done()
  }

  createPresignedUrlWithClient(filename: string) {
    const contentType = mime.lookup(filename) || 'application/octet-stream'
    const command = new PutObjectCommand({ Bucket: envConfig.S3_BUCKET_NAME, Key: filename, ContentType: contentType })
    return getSignedUrl(this.s3, command, { expiresIn: 30 })
  }

  async deleteFiles(keys: string[]) {
    if (keys.length === 0) return

    // Convert possible full URLs to raw object keys expected by AWS SDK.
    // Users might pass either the object key (e.g. "folder/file.jpg") or the full
    // S3 URL (e.g. "https://bucket.s3.region.amazonaws.com/folder/file.jpg").
    // The DeleteObjectsCommand **must** receive only the key relative to the bucket.
    const objects = keys.map((raw) => {
      try {
        // If the string is a valid URL, extract the pathname minus leading '/'
        const url = new URL(raw)
        return { Key: url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname }
      } catch {
        // Not a URL – assume it's already the key
        return { Key: raw }
      }
    })

    const command = new DeleteObjectsCommand({
      Bucket: envConfig.S3_BUCKET_NAME,
      Delete: { Objects: objects },
    })

    await this.s3.send(command)
  }
}

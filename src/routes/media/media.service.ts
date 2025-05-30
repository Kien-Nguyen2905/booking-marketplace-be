import { Injectable } from '@nestjs/common'
import { S3Service } from 'src/shared/services/s3.service'
import { generateRandomFilename } from 'src/shared/helpers'
import { PresignedUploadFileBodyType } from 'src/routes/media/media.model'
@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async getPresignedUrl(body: PresignedUploadFileBodyType) {
    const randomFilename = generateRandomFilename(body.filename)
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename)
    const url = presignedUrl.split('?')[0]
    return {
      presignedUrl,
      url,
    }
  }

  async deleteOldFiles(oldFileKeys: string[] | undefined) {
    if (oldFileKeys && oldFileKeys.length > 0) {
      await this.s3Service.deleteFiles(oldFileKeys)
      return { message: 'Old files deleted successfully' }
    }
  }
}

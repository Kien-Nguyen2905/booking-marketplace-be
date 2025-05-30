import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { DeleteFilesBodyDTO, PresignedUploadFileBodyDTO, PresignedUploadFileResDTO } from 'src/routes/media/media.dto'
import { MediaService } from 'src/routes/media/media.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageResDTO } from 'src/shared/dto/response.dto'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload/presigned-url')
  @ZodSerializerDto(PresignedUploadFileResDTO)
  async createPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignedUrl(body)
  }
  @Post('images/delete')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async deleteOldFiles(@Body() body: DeleteFilesBodyDTO) {
    return this.mediaService.deleteOldFiles(body.oldFileKeys)
  }
}

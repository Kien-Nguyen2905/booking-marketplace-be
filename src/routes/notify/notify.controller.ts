import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateNotifyBodyDTO,
  CreateNotifyResDTO,
  GetNotifiesByRecipientIdResDTO,
  UpdateNotifyReadAtResDTO,
} from 'src/routes/notify/notify.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('notifications')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}
  @Get()
  @ZodSerializerDto(GetNotifiesByRecipientIdResDTO)
  async list(
    @Query() query: { limit: number; page: number },
    @ActiveUser('userId') userId: number,
    @ActiveUser('roleName') roleName: string,
  ) {
    return await this.notifyService.list({ limit: +query.limit, page: +query.page, recipientId: userId, roleName })
  }

  @Post()
  @ZodSerializerDto(CreateNotifyResDTO)
  async create(@Body() body: CreateNotifyBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.notifyService.create({ data: body, createdById: userId })
  }

  @Put('read/:id')
  @ZodSerializerDto(UpdateNotifyReadAtResDTO)
  async updateReadAt(@Param('id') id: string) {
    return await this.notifyService.updateReadAt({ id: +id })
  }
}

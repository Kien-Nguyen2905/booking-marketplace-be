import { Injectable } from '@nestjs/common'
import { NotifyRepo } from './notify.repo'
import { CreateNotifyBodyType, GetNotifiesByRecipientIdQueryType } from 'src/routes/notify/notify.model'
import { generateRoomAdminToPartner } from 'src/shared/helpers'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { EVENT } from 'src/shared/constants/event.constant'
import { WebSocketGateway } from '@nestjs/websockets'

@Injectable()
@WebSocketGateway({ namespace: '' })
export class NotifyService {
  @WebSocketServer()
  server: Server

  constructor(private notifyRepo: NotifyRepo) {}

  async list(query: GetNotifiesByRecipientIdQueryType & { recipientId?: number; roleName?: string }) {
    return this.notifyRepo.list(query)
  }

  async create({ data, createdById }: { data: CreateNotifyBodyType; createdById: number }) {
    const notify = await this.notifyRepo.create({ data, createdById })
    return notify
  }

  async updateReadAt({ id }: { id: number }) {
    return this.notifyRepo.updateReadAt({ id })
  }

  async createMultiplePartner({ data, createdById }: { data: CreateNotifyBodyType; createdById: number }) {
    const notify = await this.notifyRepo.createMultiplePartner({ data, createdById })
    this.server.to(generateRoomAdminToPartner()).emit(EVENT.NOTIFY, notify)
    return notify
  }
}

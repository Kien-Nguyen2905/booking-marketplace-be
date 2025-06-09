import { Module } from '@nestjs/common'
import { MessageGateway } from 'src/websockets/message.gateway'

@Module({
  providers: [MessageGateway],
})
export class WebsocketModule {}

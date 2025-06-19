import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions, Server, Socket } from 'socket.io'
import {
  generateRoomAdmin,
  generateRoomAdminToPartner,
  generateRoomPartnerId,
  generateRoomPartnerToAdmin,
  generateRoomUserId,
} from 'src/shared/helpers'
import { TokenService } from 'src/shared/services/token.service'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import envConfig from 'src/shared/config'
import { ROLE_NAME } from 'src/shared/constants/role.constant'

export class WebsocketAdapter extends IoAdapter {
  private readonly tokenService: TokenService
  private adapterConstructor: ReturnType<typeof createAdapter>
  constructor(app: INestApplicationContext) {
    super(app)
    this.tokenService = app.get(TokenService)
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: envConfig.REDIS_URL })
    const subClient = pubClient.duplicate()
    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    })

    server.use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })
    server.of(/.*/).use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })

    return server
  }

  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    const { authorization } = socket.handshake.headers
    if (!authorization) {
      return next(new Error('Missing Authorization header'))
    }
    const accessToken = authorization.split(' ')[1]
    if (!accessToken) {
      return next(new Error('Missing access token'))
    }
    try {
      const { userId, roleName } = await this.tokenService.verifyAccessToken(accessToken)

      if (roleName === ROLE_NAME.PARTNER) {
        await socket.join(generateRoomAdminToPartner())
        await socket.join(generateRoomPartnerId(userId))
      }
      if (roleName === ROLE_NAME.ADMIN) {
        await socket.join(generateRoomAdmin())
        await socket.join(generateRoomPartnerToAdmin())
      }
      // Mỗi thiết bị chung account khi kết nối sẽ vô chung 1 room
      await socket.join(generateRoomUserId(userId))
      next()
    } catch (error) {
      next(error)
    }
  }
}

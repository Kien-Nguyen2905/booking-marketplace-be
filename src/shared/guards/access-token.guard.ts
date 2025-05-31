import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { UserInactiveException } from 'src/routes/auth/auth.error'
import { REQUEST_ROLE_PERMISSIONS, REQUEST_USER_KEY, UserStatus } from 'src/shared/constants/auth.constant'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // Extract và validate token
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // Validate user status
    await this.validateUserStatus(decodedAccessToken)

    // Check user permission
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('Invalid AccessToken')
    }
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Missing AccessToken')
    }
    return accessToken
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: any): Promise<void> {
    const roleId: number = decodedAccessToken.roleId
    const path: string = request.route.path
    const method = request.method as keyof typeof HTTPMethod
    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
        },
        include: {
          PermissionToRole: {
            where: {
              permission: {
                path,
                method,
              },
            },
            include: {
              permission: true,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException()
      })
    const canAccess = role.PermissionToRole.length > 0
    if (!canAccess) {
      throw new ForbiddenException()
    }
    request[REQUEST_ROLE_PERMISSIONS] = { ...role, permissions: role.PermissionToRole.map((ptr) => ptr.permission) }
  }

  private async validateUserStatus(decodedAccessToken: AccessTokenPayload): Promise<void> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: {
        id: decodedAccessToken.userId,
      },
    })
    if (user.status === UserStatus.INACTIVE) {
      throw UserInactiveException
    }
  }
}

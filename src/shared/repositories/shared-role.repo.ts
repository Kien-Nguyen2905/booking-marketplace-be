import { Injectable } from '@nestjs/common'
import { ROLE_NAME } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class SharedRoleRepository {
  private customerRoleId: number | null = null
  private adminRoleId: number | null = null
  private partnerRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    const role = await this.prismaService.role.findUnique({
      where: {
        name: roleName,
      },
    })
    if (!role) {
      throw new Error('Role not found')
    }
    return role
  }

  // Get customer role id
  async getCustomerRoleId() {
    // Check if customer role id is already cached
    if (this.customerRoleId) {
      return this.customerRoleId
    }
    const role = await this.getRole(ROLE_NAME.CUSTOMER)

    this.customerRoleId = role.id
    return role.id
  }

  // Get admin role id
  async getAdminRoleId() {
    // Check if admin role id is already cached
    if (this.adminRoleId) {
      return this.adminRoleId
    }
    const role = await this.getRole(ROLE_NAME.ADMIN)

    this.adminRoleId = role.id
    return role.id
  }

  // Get partner role id
  async getPartnerRoleId() {
    // Check if partner role id is already cached
    if (this.partnerRoleId) {
      return this.partnerRoleId
    }
    const role = await this.getRole(ROLE_NAME.PARTNER)

    this.partnerRoleId = role.id
    return role.id
  }
}

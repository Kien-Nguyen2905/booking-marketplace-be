import { Module } from '@nestjs/common'
import { PermissionController } from 'src/routes/permission/permission.controller'
import { PermissionRepo } from 'src/routes/permission/permission.repo'
import { PermissionService } from 'src/routes/permission/permission.service'
import { PrismaService } from 'src/shared/services/prisma.service'

@Module({
  providers: [PermissionService, PermissionRepo, PrismaService],
  controllers: [PermissionController],
})
export class PermissionModule {}

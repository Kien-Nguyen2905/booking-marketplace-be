import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { HTTPMethod, ROLE_NAME } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

async function bootstrap() {
  // Initialize NestJS app and Prisma service
  const app = await NestFactory.create(AppModule)
  const prisma = new PrismaService()
  await app.listen(3010)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  try {
    // Fetch existing non-deleted permissions from the database
    const permissionsInDb = await prisma.permission.findMany()

    // Extract available routes from the NestJS router
    const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string; module: string }[] =
      router.stack
        .map((layer) => {
          if (layer.route) {
            const path = layer.route?.path
            const method = String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPMethod
            const moduleName = String(path.split('/')[1]).toUpperCase()
            return {
              path,
              method,
              name: `${method} ${path}`,
              module: moduleName,
            }
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== undefined)

    // Create a map of permissions in the database with key [method-path]
    const permissionInDbMap: Record<string, (typeof permissionsInDb)[0]> = permissionsInDb.reduce(
      (acc, item) => {
        acc[`${item.method}-${item.path}`] = item
        return acc
      },
      {} as Record<string, (typeof permissionsInDb)[0]>,
    )

    // Create a map of available routes with key [method-path]
    const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce(
      (acc, item) => {
        acc[`${item.method}-${item.path}`] = item
        return acc
      },
      {} as Record<string, (typeof availableRoutes)[0]>,
    )

    // Find permissions in the database that no longer exist in available routes
    const permissionsToDelete = permissionsInDb.filter((item) => !availableRoutesMap[`${item.method}-${item.path}`])

    // Delete permissions that no longer exist
    if (permissionsToDelete.length > 0) {
      await prisma.$transaction(async (prisma) => {
        const deleteResult = await prisma.permission.deleteMany({
          where: {
            id: {
              in: permissionsToDelete.map((item) => item.id),
            },
          },
        })
        console.log('Soft-deleted permissions:', deleteResult.count)
        const deletePermissionToRoleResult = await prisma.permissionToRole.deleteMany({
          where: {
            permissionId: {
              in: permissionsToDelete.map((item) => item.id),
            },
          },
        })
        console.log('Soft-deleted permissionToRole:', deletePermissionToRoleResult.count)
      })
    } else {
      console.log('No permissions to delete')
    }

    // Find routes that don’t exist in the database permissions
    const routesToAdd = availableRoutes.filter((item) => !permissionInDbMap[`${item.method}-${item.path}`])

    // Add new permissions to the database
    if (routesToAdd.length > 0) {
      const permissionsToAdd = await prisma.permission.createMany({
        data: routesToAdd.map((route) => ({
          name: route.name,
          path: route.path,
          method: route.method,
          createdAt: new Date(),
        })),
        skipDuplicates: true,
      })
      console.log('Added permissions:', permissionsToAdd.count)
    } else {
      console.log('No permissions to add')
    }

    // Fetch updated permissions after synchronization
    const updatedPermissionsInDb = await prisma.permission.findMany()

    // Find the Admin role
    const adminRole = await prisma.role.findFirst({
      where: {
        name: ROLE_NAME.ADMIN,
      },
    })

    if (!adminRole) {
      console.error('Admin role not found')
      process.exit(1)
    }

    // Update Admin role’s permissions using PermissionToRole
    await prisma.$transaction(async (prisma) => {
      // Delete existing PermissionToRole records for the Admin role
      await prisma.permissionToRole.deleteMany({
        where: {
          roleId: adminRole.id,
        },
      })

      // Create new PermissionToRole records for all non-deleted permissions
      if (updatedPermissionsInDb.length > 0) {
        await prisma.permissionToRole.createMany({
          data: updatedPermissionsInDb.map((permission) => ({
            roleId: adminRole.id,
            permissionId: permission.id,
          })),
        })
      }
    })

    console.log('Updated Admin role permissions')
  } catch (error) {
    console.error('Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await app.close()
    process.exit(0)
  }
}

bootstrap()

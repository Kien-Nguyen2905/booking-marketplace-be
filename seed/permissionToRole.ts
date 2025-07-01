import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { AuthType } from 'src/shared/constants/auth.constant'
import { HTTPMethod, ROLE_NAME } from 'src/shared/constants/role.constant'
import { AUTH_TYPE_KEY } from 'src/shared/decorators/auth.decorator'
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

    // Extract available routes from the NestJS router and filter out public routes
    const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string; module: string }[] =
      router.stack
        .map((layer) => {
          if (layer.route) {
            const path = layer.route?.path
            const method = String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPMethod
            const moduleName = String(path.split('/')[1]).toUpperCase()

            // Skip public routes marked with @IsPublic or @IsPublicNotAPIKey decorators
            // Try to get the controller and handler from the route
            const handler = layer.route?.stack[0].handle
            let isPublic = false

            // Check if route handler has public metadata
            if (handler && handler.constructor) {
              // Try to get metadata from the handler method
              try {
                // Get the auth type metadata from the handler
                const handlerAuthMeta = Reflect.getMetadata(AUTH_TYPE_KEY, handler)

                // Check if handler is marked with IsPublic or IsPublicNotAPIKey
                if (handlerAuthMeta) {
                  const { authTypes } = handlerAuthMeta
                  isPublic = authTypes.includes(AuthType.None) || authTypes.includes(AuthType.APIKey)
                }
              } catch (error) {
                // Ignore metadata reading errors
              }
            }

            if (isPublic) {
              console.log(`Skipping public route: ${method} ${path}`)
              return undefined
            }

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
        const deletePermissionToRoleResult = await prisma.permissionToRole.deleteMany({
          where: {
            permissionId: {
              in: permissionsToDelete.map((item) => item.id),
            },
          },
        })
        console.log('Deleted permissionToRole:', deletePermissionToRoleResult.count)

        const deleteResult = await prisma.permission.deleteMany({
          where: {
            id: {
              in: permissionsToDelete.map((item) => item.id),
            },
          },
        })
        console.log('Deleted permissions:', deleteResult.count)
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

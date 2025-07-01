import envConfig from 'src/shared/config'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ROLE_NAME } from 'src/shared/constants/role.constant'
const prisma = new PrismaService()
const hashingService = new HashingService()
const main = async () => {
  const roleCount = await prisma.role.count()
  if (roleCount > 0) {
    console.log('Roles already exist')
    process.exit(0)
  }
  const roles = await prisma.role.createMany({
    data: [
      {
        name: ROLE_NAME.ADMIN,
        description: 'Admin role',
      },
      {
        name: ROLE_NAME.CUSTOMER,
        description: 'Customer role',
      },
      {
        name: ROLE_NAME.PARTNER,
        description: 'Partner role',
      },
    ],
  })

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: ROLE_NAME.ADMIN,
    },
  })
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)

  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      fullName: envConfig.ADMIN_NAME,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  })

  return {
    createdRoleCount: roles.count,
    adminUser,
  }
}

main()
  .then(({ createdRoleCount, adminUser }) => {
    console.log(`Created ${createdRoleCount} roles`)
    console.log(`Created admin user: ${adminUser.email}`)
  })
  .catch(console.error)

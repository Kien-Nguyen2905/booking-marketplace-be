import { Module } from '@nestjs/common'
import { RoleModule } from 'src/routes/role/role.module'
import { RoleRepo } from 'src/routes/role/role.repo'
import { UserController } from 'src/routes/user/user.controller'
import { UserRepo } from 'src/routes/user/user.repo'
import { UserService } from 'src/routes/user/user.service'

@Module({
  imports: [RoleModule],
  providers: [UserService, UserRepo, RoleRepo],
  controllers: [UserController],
})
export class UserModule {}

import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  GetUserParamsDTO,
  GetUsersQueryDTO,
  GetUsersResDTO,
  UpdateUserBodyDTO,
} from 'src/routes/user/user.dto'
import { UserService } from 'src/routes/user/user.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dto/shared-user.dto'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodSerializerDto(GetUsersResDTO)
  list(@Query() query: GetUsersQueryDTO) {
    return this.userService.list(query)
  }

  @Get(':userId')
  @ZodSerializerDto(GetUserProfileResDTO)
  findById(@Param() params: GetUserParamsDTO) {
    return this.userService.findById(params.userId)
  }

  @Post()
  @ZodSerializerDto(CreateUserResDTO)
  create(@Body() body: CreateUserBodyDTO, @ActiveUser('userId') userId: number) {
    return this.userService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':userId')
  @ZodSerializerDto(UpdateProfileResDTO)
  update(@Body() body: UpdateUserBodyDTO, @Param() params: GetUserParamsDTO, @ActiveUser('userId') userId: number) {
    return this.userService.update({
      data: body,
      id: params.userId,
      updatedById: userId,
    })
  }
}

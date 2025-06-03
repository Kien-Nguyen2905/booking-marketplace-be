import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateRoleBodyDTO,
  CreateRoleResDTO,
  GetRoleDetailResDTO,
  GetRoleParamsDTO,
  GetRolesResDTO,
  UpdateRoleBodyDTO,
  UpdateRoleResDTO,
} from 'src/routes/role/role.dto'
import { RoleService } from 'src/routes/role/role.service'
import { MessageResDTO } from 'src/shared/dto/response.dto'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodSerializerDto(GetRolesResDTO)
  list() {
    return this.roleService.list()
  }

  @Get(':roleId')
  @ZodSerializerDto(GetRoleDetailResDTO)
  findById(@Param() params: GetRoleParamsDTO) {
    return this.roleService.findById(params.roleId)
  }

  @Post()
  @ZodSerializerDto(CreateRoleResDTO)
  create(@Body() body: CreateRoleBodyDTO) {
    return this.roleService.create({
      data: body,
    })
  }

  @Put(':roleId')
  @ZodSerializerDto(UpdateRoleResDTO)
  update(@Body() body: UpdateRoleBodyDTO, @Param() params: GetRoleParamsDTO) {
    return this.roleService.update({
      data: body,
      id: params.roleId,
    })
  }

  @Delete(':roleId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetRoleParamsDTO) {
    return this.roleService.delete({
      id: params.roleId,
    })
  }
}

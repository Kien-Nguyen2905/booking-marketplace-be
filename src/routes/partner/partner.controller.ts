import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { PartnerService } from 'src/routes/partner/partner.service'
import {
  CreatePartnerBodyDTO,
  CreatePartnerResDTO,
  GetPartnerByIdResDTO,
  GetPartnerByUserIdResDTO,
  GetPartnersQueryDTO,
  GetPartnersResDTO,
  UpdatePartnerBodyDTO,
  UpdatePartnerResDTO,
  UpdatePartnerStatusBodyDTO,
  UpdatePartnerStatusResDTO,
} from 'src/routes/partner/partner.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get()
  @ZodSerializerDto(GetPartnersResDTO)
  list(@Query() query: GetPartnersQueryDTO) {
    return this.partnerService.list(query)
  }

  @Get('user-id')
  @ZodSerializerDto(GetPartnerByUserIdResDTO)
  async getPartnerByUserId(@ActiveUser('userId') userId: number) {
    return this.partnerService.findByUserId(userId)
  }

  @Get(':id')
  @ZodSerializerDto(GetPartnerByIdResDTO)
  async getPartnerById(@Param('id') id: string) {
    return this.partnerService.findById(+id)
  }

  @Post()
  @ZodSerializerDto(CreatePartnerResDTO)
  async createPartner(@Body() body: CreatePartnerBodyDTO, @ActiveUser('userId') userId: number) {
    return this.partnerService.create({ data: body, userId })
  }

  @Put()
  @ZodSerializerDto(UpdatePartnerResDTO)
  async updatePartner(@Body() body: UpdatePartnerBodyDTO, @ActiveUser('userId') userId: number) {
    return this.partnerService.update({ data: body, userId })
  }

  @Put('status')
  @ZodSerializerDto(UpdatePartnerStatusResDTO)
  async updatePartnerStatus(@Body() body: UpdatePartnerStatusBodyDTO, @ActiveUser('userId') adminId: number) {
    return this.partnerService.updatePartnerStatus({ data: body, partnerId: body.userId, createdById: adminId })
  }
}

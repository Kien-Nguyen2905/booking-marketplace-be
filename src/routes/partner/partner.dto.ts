import { createZodDto } from 'nestjs-zod'
import {
  CreatePartnerBodySchema,
  CreatePartnerResSchema,
  GetPartnerByIdResSchema,
  GetPartnerByUserIdResSchema,
  GetPartnersQuerySchema,
  GetPartnersResSchema,
  UpdatePartnerBodySchema,
  UpdatePartnerByAdminBodySchema,
  UpdatePartnerResSchema,
  UpdatePartnerStatusBodySchema,
  UpdatePartnerStatusResSchema,
  UpdatePartnerByAdminResSchema,
} from 'src/routes/partner/partner.model'

export class GetPartnerByUserIdResDTO extends createZodDto(GetPartnerByUserIdResSchema) {}
export class GetPartnersResDTO extends createZodDto(GetPartnersResSchema) {}
export class GetPartnersQueryDTO extends createZodDto(GetPartnersQuerySchema) {}
export class CreatePartnerBodyDTO extends createZodDto(CreatePartnerBodySchema) {}
export class CreatePartnerResDTO extends createZodDto(CreatePartnerResSchema) {}
export class UpdatePartnerBodyDTO extends createZodDto(UpdatePartnerBodySchema) {}
export class UpdatePartnerResDTO extends createZodDto(UpdatePartnerResSchema) {}
export class UpdatePartnerStatusBodyDTO extends createZodDto(UpdatePartnerStatusBodySchema) {}
export class UpdatePartnerStatusResDTO extends createZodDto(UpdatePartnerStatusResSchema) {}
export class GetPartnerByIdResDTO extends createZodDto(GetPartnerByIdResSchema) {}
export class UpdatePartnerByAdminBodyDTO extends createZodDto(UpdatePartnerByAdminBodySchema) {}
export class UpdatePartnerByAdminResDTO extends createZodDto(UpdatePartnerByAdminResSchema) {}

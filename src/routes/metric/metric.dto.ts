import { createZodDto } from 'nestjs-zod'
import { 
  DashboardMetricsQuerySchema, 
  DashboardMetricsResSchema,
  PartnerDashboardMetricsQuerySchema,
  PartnerDashboardMetricsResSchema 
} from './metric.model'

export class DashboardMetricsQueryDto extends createZodDto(DashboardMetricsQuerySchema) {}
export class DashboardMetricsResDto extends createZodDto(DashboardMetricsResSchema) {}

export class PartnerDashboardMetricsQueryDto extends createZodDto(PartnerDashboardMetricsQuerySchema) {}
export class PartnerDashboardMetricsResDto extends createZodDto(PartnerDashboardMetricsResSchema) {}

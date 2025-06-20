import { Controller, Get, Param, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  DashboardMetricsQueryDto,
  DashboardMetricsResDto,
  PartnerDashboardMetricsQueryDto,
  PartnerDashboardMetricsResDto,
} from './metric.dto'
import { MetricService } from './metric.service'

@Controller('metrics')
export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  @Get('/dashboard')
  @ZodSerializerDto(DashboardMetricsResDto)
  async getDashboardMetrics(@Query() query: DashboardMetricsQueryDto) {
    return await this.metricService.getDashboardMetrics(query)
  }

  @Get('/partner-dashboard/:hotelId')
  @ZodSerializerDto(PartnerDashboardMetricsResDto)
  async getPartnerDashboardMetrics(@Param('hotelId') hotelId: string, @Query() query: PartnerDashboardMetricsQueryDto) {
    return await this.metricService.getPartnerDashboardMetrics({ hotelId: +hotelId, ...query })
  }
}

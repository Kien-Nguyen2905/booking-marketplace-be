import { Injectable } from '@nestjs/common'
import { MetricRepo } from './metric.repo'
import { DashboardMetricsQueryType, PartnerDashboardMetricsQueryType } from './metric.model'

@Injectable()
export class MetricService {
  constructor(private readonly metricRepo: MetricRepo) {}

  async getDashboardMetrics(query: DashboardMetricsQueryType) {
    const { dateFrom, dateTo } = query
    return await this.metricRepo.getDashboardMetrics({ dateFrom, dateTo })
  }

  async getPartnerDashboardMetrics(query: PartnerDashboardMetricsQueryType & { hotelId: number }) {
    const { hotelId, dateFrom, dateTo } = query
    return await this.metricRepo.getPartnerDashboardMetrics({ hotelId, dateFrom, dateTo })
  }
}

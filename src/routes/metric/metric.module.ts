import { Module } from '@nestjs/common'
import { MetricService } from './metric.service'
import { MetricController } from './metric.controller'
import { MetricRepo } from 'src/routes/metric/metric.repo'

@Module({
  controllers: [MetricController],
  providers: [MetricService, MetricRepo],
})
export class MetricModule {}

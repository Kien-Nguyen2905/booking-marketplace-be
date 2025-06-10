import { Module } from '@nestjs/common'
import { CustomerService } from './customer.service'
import { CustomerController } from './customer.controller'
import { CustomerRepo } from 'src/routes/customer/customer.repo'

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepo],
})
export class CustomerModule {}

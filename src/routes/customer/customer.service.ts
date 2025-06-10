import { Injectable } from '@nestjs/common'
import { CustomerRepo } from './customer.repo'
import { CreateCustomerBodyType, GetCustomersQueryType } from 'src/routes/customer/customer.model'

@Injectable()
export class CustomerService {
  constructor(private customerRepo: CustomerRepo) {}

  async list(query: GetCustomersQueryType) {
    return await this.customerRepo.list(query)
  }

  async create(data: CreateCustomerBodyType) {
    return await this.customerRepo.create(data)
  }
}

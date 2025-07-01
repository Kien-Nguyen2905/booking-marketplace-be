import { Controller, Get, Query } from '@nestjs/common'
import { CustomerService } from './customer.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetCustomersQueryDTO, GetCustomersResDTO } from './customer.dto'

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ZodSerializerDto(GetCustomersResDTO)
  async list(@Query() query: GetCustomersQueryDTO) {
    return await this.customerService.list({
      limit: +query.limit,
      page: +query.page,
      search: query.search,
    })
  }
}

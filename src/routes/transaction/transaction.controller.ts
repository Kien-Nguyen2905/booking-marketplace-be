import { Controller, Get, Param, Query } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import {
  GetTransactionResDTO,
  GetTransactionsQueryDTO,
  GetTransactionsResDTO,
} from 'src/routes/transaction/transaction.dto'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ZodSerializerDto(GetTransactionsResDTO)
  async list(@Query() query: GetTransactionsQueryDTO) {
    return this.transactionService.list(query)
  }

  @Get(':id')
  @ZodSerializerDto(GetTransactionResDTO)
  async findById(@Param('id') id: string) {
    return this.transactionService.findById(+id)
  }
}

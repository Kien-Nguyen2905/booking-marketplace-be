import { Injectable } from '@nestjs/common'
import { TransactionRepo } from './transaction.repo'
import { GetTransactionsQueryType } from 'src/routes/transaction/transaction.model'

@Injectable()
export class TransactionService {
  constructor(private transactionRepo: TransactionRepo) {}

  async list(query: GetTransactionsQueryType) {
    return await this.transactionRepo.list(query)
  }

  async findById(id: number) {
    return await this.transactionRepo.findById(id)
  }
}

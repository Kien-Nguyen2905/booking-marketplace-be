import { Injectable } from '@nestjs/common'
import { RefundRepo } from './refund.repo'
import { CreateRefundBodyType, GetRefundsQueryType } from 'src/routes/refund/refund.model'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { RefundAlreadyExistsException } from 'src/routes/refund/refund.error'

@Injectable()
export class RefundService {
  constructor(private refundRepo: RefundRepo) {}

  async list(query: GetRefundsQueryType) {
    return await this.refundRepo.list(query)
  }

  async listByUserId(query: GetRefundsQueryType & { userId: number }) {
    return await this.refundRepo.listByUserId(query)
  }

  async findById(id: number) {
    return await this.refundRepo.findById(id)
  }

  async create(data: CreateRefundBodyType & { createdById: number }) {
    try {
      return await this.refundRepo.create(data)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RefundAlreadyExistsException
      }
      throw error
    }
  }
}

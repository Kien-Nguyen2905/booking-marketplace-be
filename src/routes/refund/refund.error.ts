import { BadRequestException } from '@nestjs/common'

export const RefundAlreadyExistsException = new BadRequestException('Refund already exists')

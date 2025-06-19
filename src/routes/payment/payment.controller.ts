import { Body, Controller, Post } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dto/response.dto'
import { WebhookPaymentBodyDTO } from 'src/routes/payment/payment.dto'
import { IsPublicNotAPIKey } from 'src/shared/decorators/auth.decorator'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('/receiver')
  @IsPublicNotAPIKey()
  @ZodSerializerDto(MessageResDTO)
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}

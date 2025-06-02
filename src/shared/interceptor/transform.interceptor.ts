import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ZodType } from 'zod'
import { MessageKey } from 'src/shared/decorators/message.decorator'

const ZOD_SERIALIZER_DTO_OPTIONS = 'ZOD_SERIALIZER_DTO_OPTIONS' as const

@Injectable()
export class CustomZodSerializerInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    if (request.url === '/metrics') {
      return next.handle() // Bỏ qua /metrics
    }
    let statusCode = context.switchToHttp().getResponse().statusCode
    // Lấy message từ decorator @Message, mặc định là 'Success' nếu không có
    const defaultMessage = this.reflector.get<string | undefined>(MessageKey, context.getHandler()) ?? 'Successful'
    // Lấy schema từ decorator @ZodSerializerDto
    const dtoSchemaOrClass = this.reflector.getAllAndOverride<any>(ZOD_SERIALIZER_DTO_OPTIONS, [
      context.getHandler(),
      context.getClass(),
    ])

    let schema: ZodType<any> | undefined
    if (dtoSchemaOrClass) {
      if (typeof dtoSchemaOrClass === 'function') {
        const maybeSchema = (dtoSchemaOrClass as any).schema
        if (typeof maybeSchema === 'function') {
          schema = maybeSchema()
        } else {
          schema = maybeSchema as ZodType<any>
        }
      } else if (typeof dtoSchemaOrClass === 'object' && 'parse' in dtoSchemaOrClass) {
        // It is already a Zod schema instance
        schema = dtoSchemaOrClass as ZodType<any>
      }
    }

    return next.handle().pipe(
      map((response) => {
        let data = response
        let message = defaultMessage

        // Kiểm tra xem response có phải là object và có chứa message không
        if (response && typeof response === 'object' && 'message' in response) {
          message = response.message || defaultMessage // Ưu tiên message từ response
          statusCode = response.statusCode || statusCode
          data = {} // Đặt data là object rỗng nếu response có message
        }

        // Tuần tự hóa dữ liệu với schema Zod nếu có
        const serializedData = schema ? schema.parse(data) : (data ?? null)

        return {
          message,
          statusCode,
          data: serializedData,
        }
      }),
    )
  }
}

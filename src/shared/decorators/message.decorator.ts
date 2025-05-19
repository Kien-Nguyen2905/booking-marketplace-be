import { SetMetadata } from '@nestjs/common'

export const MessageKey = 'message'
export const Message = (message: string) => SetMetadata(MessageKey, message)

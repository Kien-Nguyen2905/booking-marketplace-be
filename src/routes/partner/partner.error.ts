import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'

export const PartnerAlreadyExistsException = new BadRequestException('Partner already exists')

export const PartnerNotFoundException = new BadRequestException('Partner not found')

export const PartnerPendingException = new BadRequestException('Partner is pending')

export const PartnerRejectedException = new BadRequestException('Partner is rejected')

export const PartnerAcceptedException = new BadRequestException('Partner is accepted')

export const PartnerAlreadyAcceptedException = new BadRequestException('Partner is already accepted')

export const PartnerUnauthorizedAccessException = new UnprocessableEntityException('Email is used for admin')

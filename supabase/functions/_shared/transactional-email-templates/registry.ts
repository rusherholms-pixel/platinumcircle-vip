/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as bookingReceived } from './booking-received.tsx'
import { template as bookingModified } from './booking-modified.tsx'
import { template as bookingCancelled } from './booking-cancelled.tsx'
import { template as conciergeReply } from './concierge-reply.tsx'
import { template as newBookingAlert } from './new-booking-alert.tsx'
import { template as newMemberMessage } from './new-member-message.tsx'
import { template as miaEscalation } from './mia-escalation.tsx'
import { template as welcomeInvitation } from './welcome-invitation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'booking-received': bookingReceived,
  'booking-modified': bookingModified,
  'booking-cancelled': bookingCancelled,
  'concierge-reply': conciergeReply,
  'new-booking-alert': newBookingAlert,
  'new-member-message': newMemberMessage,
  'mia-escalation': miaEscalation,
  'welcome-invitation': welcomeInvitation,
}

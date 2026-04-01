import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface BookingReceivedProps {
  memberName?: string
  serviceTitle?: string
  serviceType?: string
  checkIn?: string
  checkOut?: string
  numGuests?: number
  referenceId?: string
}

const BookingReceivedEmail = ({
  memberName, serviceTitle, serviceType, checkIn, checkOut, numGuests, referenceId,
}: BookingReceivedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your request has been received — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Your Request Has Been Received</Heading>

        <Text style={text}>
          {memberName ? `Dear ${memberName},` : 'Dear Member,'}
        </Text>

        <Text style={text}>
          We have received your request and our concierge team is reviewing the details.
          We typically respond within a few hours.
        </Text>

        <Section style={detailsBox}>
          {serviceTitle && (
            <Text style={detailRow}>
              <span style={detailLabel}>Service:</span> {serviceTitle}
            </Text>
          )}
          {serviceType && (
            <Text style={detailRow}>
              <span style={detailLabel}>Category:</span> {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
            </Text>
          )}
          {checkIn && (
            <Text style={detailRow}>
              <span style={detailLabel}>Date:</span> {checkIn}{checkOut ? ` — ${checkOut}` : ''}
            </Text>
          )}
          {numGuests && (
            <Text style={detailRow}>
              <span style={detailLabel}>Guests:</span> {numGuests}
            </Text>
          )}
        </Section>

        {referenceId && (
          <Text style={refText}>Reference: {referenceId.slice(0, 8).toUpperCase()}</Text>
        )}

        <Button style={ctaButton} href="https://platinumcircle.vip/member/bookings">
          View Request Status
        </Button>

        <Hr style={hr} />

        <Text style={footer}>
          {SITE_NAME} — Private Members Concierge
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingReceivedEmail,
  subject: (data: Record<string, any>) =>
    `Your Request Has Been Received — ${data.serviceType ? data.serviceType.charAt(0).toUpperCase() + data.serviceType.slice(1) : 'Booking'}`,
  displayName: 'Booking request received',
  previewData: {
    memberName: 'Alexandre',
    serviceTitle: 'Private Villa — Mykonos',
    serviceType: 'housing',
    checkIn: '2026-07-15',
    checkOut: '2026-07-22',
    numGuests: 8,
    referenceId: 'a1b2c3d4-e5f6',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '30px' }
const brandText = { fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const h1 = { fontSize: '26px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 24px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.65', margin: '0 0 18px' }
const detailsBox = { backgroundColor: '#faf8f5', borderLeft: '3px solid #b8963e', padding: '16px 20px', margin: '0 0 24px', borderRadius: '0 4px 4px 0' }
const detailRow = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 6px' }
const detailLabel = { fontWeight: 'bold' as const, color: '#1a1a1a' }
const refText = { fontSize: '11px', color: '#999', letterSpacing: '0.1em', margin: '0 0 24px', textAlign: 'center' as const }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 30px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '13px', color: '#999', lineHeight: '1.5', margin: '0', textAlign: 'center' as const }

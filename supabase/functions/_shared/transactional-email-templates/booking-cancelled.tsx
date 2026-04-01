import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface BookingCancelledProps {
  memberName?: string
  serviceTitle?: string
  serviceType?: string
  checkIn?: string
  reason?: string
  referenceId?: string
}

const BookingCancelledEmail = ({
  memberName, serviceTitle, serviceType, checkIn, reason, referenceId,
}: BookingCancelledProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Important — Your booking has been cancelled — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Your Booking Has Been Cancelled</Heading>

        <Text style={text}>
          {memberName ? `Dear ${memberName},` : 'Dear Member,'}
        </Text>

        <Text style={text}>
          We want to let you know that your booking has been cancelled.
        </Text>

        <Section style={detailsBox}>
          {serviceTitle && (
            <Text style={detailRow}>
              <span style={detailLabel}>Service:</span> {serviceTitle}
            </Text>
          )}
          {checkIn && (
            <Text style={detailRow}>
              <span style={detailLabel}>Date:</span> {checkIn}
            </Text>
          )}
          {reason && (
            <Text style={detailRow}>
              <span style={detailLabel}>Reason:</span> {reason}
            </Text>
          )}
        </Section>

        <Text style={text}>
          Your concierge will be in touch to arrange an alternative or assist with anything you need.
        </Text>

        {referenceId && (
          <Text style={refText}>Reference: {referenceId.slice(0, 8).toUpperCase()}</Text>
        )}

        <Button style={ctaButton} href="https://platinumcircle.vip/member/messages">
          Contact Your Concierge
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
  component: BookingCancelledEmail,
  subject: (data: Record<string, any>) =>
    `Important — Your Booking Has Been Cancelled — ${data.serviceTitle || 'Platinum Circle'}`,
  displayName: 'Booking cancellation notice',
  previewData: {
    memberName: 'Alexandre',
    serviceTitle: 'Private Villa — Mykonos',
    checkIn: '2026-07-15',
    reason: 'Property unavailable due to maintenance',
    referenceId: 'a1b2c3d4',
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

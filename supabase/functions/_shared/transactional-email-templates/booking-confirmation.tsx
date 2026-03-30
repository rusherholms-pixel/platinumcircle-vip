import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface BookingConfirmationProps {
  memberName?: string
  serviceTitle?: string
  serviceType?: string
  checkIn?: string
  checkOut?: string
  numGuests?: number
  adminNotes?: string
}

const BookingConfirmationEmail = ({
  memberName,
  serviceTitle,
  serviceType,
  checkIn,
  checkOut,
  numGuests,
  adminNotes,
}: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your booking has been confirmed — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>
          Booking Confirmed
        </Heading>

        <Text style={text}>
          {memberName ? `Dear ${memberName},` : 'Dear Member,'}
        </Text>

        <Text style={text}>
          Great news — your booking request has been confirmed by our concierge team.
          Here are the details:
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

        {adminNotes && (
          <>
            <Text style={notesLabel}>Note from our team:</Text>
            <Section style={notesBox}>
              <Text style={notesText}>{adminNotes}</Text>
            </Section>
          </>
        )}

        <Button style={ctaButton} href="https://platinumcircle.vip/member/bookings">
          View My Bookings
        </Button>

        <Hr style={hr} />

        <Text style={footer}>
          If you have any questions, reply to this email or reach out via WhatsApp.
        </Text>
        <Text style={footer}>
          Best regards, The {SITE_NAME} Concierge Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: 'Your Booking Has Been Confirmed',
  displayName: 'Booking confirmation',
  previewData: {
    memberName: 'Alexandre',
    serviceTitle: 'Montreal Nightlife Experience',
    serviceType: 'experiences',
    checkIn: '2026-04-15',
    checkOut: '2026-04-17',
    numGuests: 6,
    adminNotes: 'Your VIP table has been reserved. A driver will pick you up at 9 PM.',
  },
} satisfies TemplateEntry

// Styles — gold accent #b8963e matches primary: 37 38% 60%
const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '30px' }
const brandText = { fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const h1 = { fontSize: '26px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 24px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.65', margin: '0 0 18px' }
const detailsBox = { backgroundColor: '#faf8f5', borderLeft: '3px solid #b8963e', padding: '16px 20px', margin: '0 0 24px', borderRadius: '0 4px 4px 0' }
const detailRow = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 6px' }
const detailLabel = { fontWeight: 'bold' as const, color: '#1a1a1a' }
const notesLabel = { fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#888', margin: '0 0 8px' }
const notesBox = { backgroundColor: '#f5f5f0', padding: '14px 18px', borderRadius: '4px', margin: '0 0 24px' }
const notesText = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.5', margin: '0', fontStyle: 'italic' as const }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 30px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '13px', color: '#999', lineHeight: '1.5', margin: '0 0 8px' }

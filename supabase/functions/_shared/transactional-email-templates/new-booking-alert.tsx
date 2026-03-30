import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface NewBookingAlertProps {
  memberName?: string
  memberEmail?: string
  serviceTitle?: string
  serviceType?: string
  checkIn?: string
  checkOut?: string
  numGuests?: number
  specialRequests?: string
  preferredContact?: string
}

const NewBookingAlertEmail = ({
  memberName,
  memberEmail,
  serviceTitle,
  serviceType,
  checkIn,
  checkOut,
  numGuests,
  specialRequests,
  preferredContact,
}: NewBookingAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New booking request from {memberName || 'a member'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME} · CONCIERGE ALERT</Text>
        </Section>

        <Heading style={h1}>New Booking Request</Heading>

        <Text style={text}>
          A new booking request has been submitted and requires your attention.
        </Text>

        <Section style={detailsBox}>
          {memberName && <Text style={detailRow}><span style={detailLabel}>Member:</span> {memberName}</Text>}
          {memberEmail && <Text style={detailRow}><span style={detailLabel}>Email:</span> {memberEmail}</Text>}
          {serviceTitle && <Text style={detailRow}><span style={detailLabel}>Service:</span> {serviceTitle}</Text>}
          {serviceType && <Text style={detailRow}><span style={detailLabel}>Category:</span> {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</Text>}
          {checkIn && <Text style={detailRow}><span style={detailLabel}>Date:</span> {checkIn}{checkOut ? ` — ${checkOut}` : ''}</Text>}
          {numGuests && <Text style={detailRow}><span style={detailLabel}>Guests:</span> {numGuests}</Text>}
          {preferredContact && <Text style={detailRow}><span style={detailLabel}>Preferred Contact:</span> {preferredContact}</Text>}
        </Section>

        {specialRequests && (
          <>
            <Text style={notesLabel}>Special Requests:</Text>
            <Section style={notesBox}>
              <Text style={notesText}>{specialRequests}</Text>
            </Section>
          </>
        )}

        <Button style={ctaButton} href="https://platinumcircle.vip/admin">
          View in Admin Dashboard
        </Button>

        <Hr style={hr} />
        <Text style={footer}>This is an automated alert from {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewBookingAlertEmail,
  subject: (data: Record<string, any>) =>
    `New Booking Request: ${data.serviceTitle || 'Service'} — ${data.memberName || 'Member'}`,
  displayName: 'New booking alert (admin)',
  to: 'slusere@yahoo.com',
  previewData: {
    memberName: 'Alexandre Dupont',
    memberEmail: 'alex@example.com',
    serviceTitle: 'Montreal Nightlife Experience',
    serviceType: 'experiences',
    checkIn: '2026-04-20',
    checkOut: '2026-04-22',
    numGuests: 8,
    specialRequests: 'VIP table preferred, bottle service included.',
    preferredContact: 'whatsapp',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const brandText = { fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const h1 = { fontSize: '24px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.65', margin: '0 0 18px' }
const detailsBox = { backgroundColor: '#faf8f5', borderLeft: '3px solid #b8963e', padding: '16px 20px', margin: '0 0 24px', borderRadius: '0 4px 4px 0' }
const detailRow = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 6px' }
const detailLabel = { fontWeight: 'bold' as const, color: '#1a1a1a' }
const notesLabel = { fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#888', margin: '0 0 8px' }
const notesBox = { backgroundColor: '#f5f5f0', padding: '14px 18px', borderRadius: '4px', margin: '0 0 24px' }
const notesText = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.5', margin: '0', fontStyle: 'italic' as const }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 28px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '12px', color: '#999', lineHeight: '1.5', margin: '0' }

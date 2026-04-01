import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface NewApplicationAlertProps {
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  applicantType?: string
  city?: string
  country?: string
  referenceNumber?: string
}

const NewApplicationAlertEmail = ({
  applicantName, applicantEmail, applicantPhone, applicantType,
  city, country, referenceNumber,
}: NewApplicationAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New {applicantType || 'member'} application from {applicantName || 'applicant'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME} · NEW APPLICATION</Text>
        </Section>

        <Heading style={h1}>New Membership Application</Heading>

        <Text style={text}>
          A new application has been submitted and is awaiting your review.
        </Text>

        <Section style={detailsBox}>
          {applicantName && <Text style={detailRow}><span style={detailLabel}>Name:</span> {applicantName}</Text>}
          {applicantEmail && <Text style={detailRow}><span style={detailLabel}>Email:</span> {applicantEmail}</Text>}
          {applicantPhone && <Text style={detailRow}><span style={detailLabel}>Phone:</span> {applicantPhone}</Text>}
          {applicantType && <Text style={detailRow}><span style={detailLabel}>Type:</span> {applicantType.charAt(0).toUpperCase() + applicantType.slice(1)}</Text>}
          {city && country && <Text style={detailRow}><span style={detailLabel}>Location:</span> {city}, {country}</Text>}
          {referenceNumber && <Text style={detailRow}><span style={detailLabel}>Reference:</span> {referenceNumber}</Text>}
        </Section>

        <Text style={urgencyNote}>
          Applicants expect a response within 48 hours — prompt review builds trust and conversion.
        </Text>

        <Button style={ctaButton} href="https://platinumcircle.vip/admin">
          Review Application
        </Button>

        <Hr style={hr} />
        <Text style={footer}>This is an automated alert from {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewApplicationAlertEmail,
  subject: (data: Record<string, any>) =>
    `New Application — ${data.applicantName || 'Applicant'} — ${data.applicantType || 'Member'} — ${data.country || 'Unknown'}`,
  displayName: 'New application alert (admin)',
  to: 'slusere@yahoo.com',
  previewData: {
    applicantName: 'Alexandre Dupont',
    applicantEmail: 'alex@example.com',
    applicantPhone: '+1 514-555-0199',
    applicantType: 'member',
    city: 'Montreal',
    country: 'Canada',
    referenceNumber: 'PC-2026-0042',
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
const urgencyNote = { fontSize: '13px', color: '#b8963e', fontStyle: 'italic' as const, margin: '0 0 24px', textAlign: 'center' as const }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 28px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '12px', color: '#999', lineHeight: '1.5', margin: '0' }

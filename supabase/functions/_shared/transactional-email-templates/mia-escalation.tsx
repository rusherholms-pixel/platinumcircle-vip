import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface MiaEscalationProps {
  leadName?: string
  email?: string
  phone?: string
  interest?: string
  timeline?: string
  groupSize?: string
  escalationReason?: string
  conversationSummary?: string
}

const MiaEscalationEmail = ({
  leadName, email, phone, interest, timeline, groupSize,
  escalationReason, conversationSummary,
}: MiaEscalationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>[Mia Escalation] — {leadName || 'Prospect'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME}</Text>
          <Text style={tagline}>MIA AI ESCALATION</Text>
        </Section>

        <Heading style={h1}>Lead Escalation from Mia</Heading>

        <Section style={detailsBox}>
          <Text style={detailRow}><span style={detailLabel}>Name:</span> {leadName || 'Unknown'}</Text>
          {email && <Text style={detailRow}><span style={detailLabel}>Email:</span> {email}</Text>}
          {phone && <Text style={detailRow}><span style={detailLabel}>Phone/WhatsApp:</span> {phone}</Text>}
          {interest && <Text style={detailRow}><span style={detailLabel}>Interest:</span> {interest}</Text>}
          {timeline && <Text style={detailRow}><span style={detailLabel}>Timeline:</span> {timeline}</Text>}
          {groupSize && <Text style={detailRow}><span style={detailLabel}>Group Size:</span> {groupSize}</Text>}
        </Section>

        {escalationReason && (
          <>
            <Text style={noteLabel}>Escalation Reason:</Text>
            <Section style={noteBox}>
              <Text style={noteText}>{escalationReason}</Text>
            </Section>
          </>
        )}

        {conversationSummary && (
          <>
            <Text style={noteLabel}>Conversation Summary:</Text>
            <Section style={noteBox}>
              <Text style={noteText}>{conversationSummary}</Text>
            </Section>
          </>
        )}

        <Button style={ctaButton} href="https://platinumcircle-vip.lovable.app/admin">
          View Full Inquiry
        </Button>

        <Hr style={hr} />
        <Text style={footer}>
          This is an internal notification for the {SITE_NAME} concierge team only.
          Do not reply to this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MiaEscalationEmail,
  subject: (data: Record<string, any>) => `[Mia Escalation] — ${data.leadName || 'Prospect'}`,
  displayName: 'Mia AI escalation alert',
  previewData: {
    leadName: 'James W.',
    email: 'james@example.com',
    phone: '+1 555-0199',
    interest: 'Bachelor package in Miami',
    timeline: 'Next month',
    groupSize: '12',
    escalationReason: 'Large group (12+), budget above $10,000, needs booking within 14 days',
    conversationSummary: 'Client is planning a bachelor party for 12 in Miami. Interested in The Bachelor Experience with yacht add-on. Prefers WhatsApp contact.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '30px' }
const brandText = { fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const tagline = { fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#999', margin: '4px 0 0' }
const h1 = { fontSize: '24px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 24px', textAlign: 'center' as const }
const detailsBox = { backgroundColor: '#faf8f5', borderLeft: '3px solid #b8963e', padding: '14px 18px', margin: '0 0 20px', borderRadius: '0 4px 4px 0' }
const detailRow = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 4px' }
const detailLabel = { fontWeight: 'bold' as const, color: '#1a1a1a' }
const noteLabel = { fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#888', margin: '0 0 8px' }
const noteBox = { backgroundColor: '#f5f5f0', padding: '14px 18px', borderRadius: '4px', margin: '0 0 20px' }
const noteText = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.5', margin: '0' }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 30px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '12px', color: '#999', lineHeight: '1.5', margin: '0', textAlign: 'center' as const }

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface NewMemberMessageProps {
  memberName?: string
  messageContent?: string
  timestamp?: string
}

const NewMemberMessageEmail = ({ memberName, messageContent, timestamp }: NewMemberMessageProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>[New Message] — {memberName || 'Member'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME}</Text>
          <Text style={tagline}>INTERNAL NOTIFICATION</Text>
        </Section>

        <Heading style={h1}>New Member Message</Heading>

        <Section style={detailsBox}>
          <Text style={detailRow}>
            <span style={detailLabel}>From:</span> {memberName || 'Member'}
          </Text>
          {timestamp && (
            <Text style={detailRow}>
              <span style={detailLabel}>Time:</span> {new Date(timestamp).toLocaleString()}
            </Text>
          )}
        </Section>

        <Text style={messageLabel}>Message:</Text>
        <Section style={messageBox}>
          <Text style={messageText}>{messageContent || '[No content]'}</Text>
        </Section>

        <Button style={ctaButton} href="https://platinumcircle-vip.lovable.app/admin">
          Reply in Dashboard
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
  component: NewMemberMessageEmail,
  subject: (data: Record<string, any>) => `[New Message] — ${data.memberName || 'Member'}`,
  displayName: 'New member message alert',
  previewData: {
    memberName: 'Alexandre D.',
    messageContent: 'I need a villa in Mykonos for 8 guests, July 15-22. Private pool is essential.',
    timestamp: '2026-04-01T14:30:00Z',
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
const messageLabel = { fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#888', margin: '0 0 8px' }
const messageBox = { backgroundColor: '#f5f5f0', padding: '16px 20px', borderRadius: '4px', margin: '0 0 24px' }
const messageText = { fontSize: '15px', color: '#1a1a1a', lineHeight: '1.6', margin: '0' }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 30px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '12px', color: '#999', lineHeight: '1.5', margin: '0', textAlign: 'center' as const }

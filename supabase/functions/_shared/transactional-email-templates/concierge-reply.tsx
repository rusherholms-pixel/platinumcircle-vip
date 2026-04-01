import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface ConciergeReplyProps {
  memberName?: string
  messagePreview?: string
}

const ConciergeReplyEmail = ({ memberName, messagePreview }: ConciergeReplyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your concierge has replied — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Your Concierge Has Replied</Heading>

        <Text style={text}>
          {memberName ? `Dear ${memberName},` : 'Dear Member,'}
        </Text>

        <Text style={text}>
          Your concierge has responded to your message.
        </Text>

        {messagePreview && (
          <Section style={previewBox}>
            <Text style={previewText}>"{messagePreview.length > 120 ? messagePreview.slice(0, 120) + '…' : messagePreview}"</Text>
          </Section>
        )}

        <Button style={ctaButton} href="https://platinumcircle.vip/member/messages">
          View Message
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
  component: ConciergeReplyEmail,
  subject: 'Your Concierge Has Replied — Platinum Circle',
  displayName: 'Concierge reply notification',
  previewData: {
    memberName: 'Alexandre',
    messagePreview: 'Your villa in Mykonos has been arranged for July 15-22. A private chef will be on-site for the duration of your stay.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '30px' }
const brandText = { fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const h1 = { fontSize: '26px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 24px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.65', margin: '0 0 18px' }
const previewBox = { backgroundColor: '#faf8f5', borderLeft: '3px solid #b8963e', padding: '16px 20px', margin: '0 0 24px', borderRadius: '0 4px 4px 0' }
const previewText = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.6', margin: '0', fontStyle: 'italic' as const }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 30px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '13px', color: '#999', lineHeight: '1.5', margin: '0', textAlign: 'center' as const }

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface SmartEscalationProps {
  escalationType?: string
  headline?: string
  details?: string
  urgencyNote?: string
  ctaLabel?: string
  ctaUrl?: string
  items?: Array<{ label: string; value: string }>
}

const SmartEscalationEmail = ({
  escalationType, headline, details, urgencyNote, ctaLabel, ctaUrl, items,
}: SmartEscalationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>⚑ {headline || 'Action Required'} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>{SITE_NAME}</Text>
          <Text style={tagline}>⚑ {escalationType || 'ESCALATION ALERT'}</Text>
        </Section>

        <Heading style={h1}>{headline || 'Action Required'}</Heading>

        {details && <Text style={text}>{details}</Text>}

        {items && items.length > 0 && (
          <Section style={detailsBox}>
            {items.map((item, i) => (
              <Text key={i} style={detailRow}>
                <span style={detailLabel}>{item.label}:</span> {item.value}
              </Text>
            ))}
          </Section>
        )}

        {urgencyNote && (
          <Text style={urgencyStyle}>{urgencyNote}</Text>
        )}

        <Button style={ctaButton} href={ctaUrl || 'https://platinumcircle.vip/admin'}>
          {ctaLabel || 'Open Dashboard'}
        </Button>

        <Hr style={hr} />
        <Text style={footer}>
          This is an automated escalation from {SITE_NAME}. Prompt responses drive retention and conversion.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SmartEscalationEmail,
  subject: (data: Record<string, any>) => `⚑ ${data.headline || 'Action Required'} — Platinum Circle`,
  displayName: 'Smart escalation alert',
  to: 'slusere@yahoo.com',
  previewData: {
    escalationType: 'UNANSWERED MESSAGE',
    headline: 'Awaiting Reply — Alexandre D. — 3 messages unanswered',
    details: 'A member has sent 3 messages with no concierge reply in the past 2 hours.',
    urgencyNote: 'Members expect prompt responses. Delayed replies directly impact satisfaction and retention.',
    ctaLabel: 'Reply Now',
    ctaUrl: 'https://platinumcircle.vip/admin',
    items: [
      { label: 'Member', value: 'Alexandre D.' },
      { label: 'Unanswered Messages', value: '3' },
      { label: 'Waiting Since', value: '2 hours ago' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '30px' }
const brandText = { fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const tagline = { fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#cc3333', margin: '4px 0 0', fontWeight: 'bold' as const }
const h1 = { fontSize: '22px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.65', margin: '0 0 18px' }
const detailsBox = { backgroundColor: '#faf8f5', borderLeft: '3px solid #cc3333', padding: '14px 18px', margin: '0 0 20px', borderRadius: '0 4px 4px 0' }
const detailRow = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 4px' }
const detailLabel = { fontWeight: 'bold' as const, color: '#1a1a1a' }
const urgencyStyle = { fontSize: '13px', color: '#cc3333', fontStyle: 'italic' as const, margin: '0 0 24px', textAlign: 'center' as const, fontWeight: 'bold' as const }
const ctaButton = { backgroundColor: '#cc3333', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 30px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '12px', color: '#999', lineHeight: '1.5', margin: '0', textAlign: 'center' as const }

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Platinum Circle"

interface WelcomeInvitationProps {
  memberName?: string
  role?: string
  loginUrl?: string
}

const WelcomeInvitationEmail = ({
  memberName,
  role = 'member',
  loginUrl = 'https://platinumcircle-vip.lovable.app/auth',
}: WelcomeInvitationProps) => {
  const isAdmin = role === 'admin'
  const roleLabel = isAdmin ? 'an administrator' : 'a member'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to {SITE_NAME} — Your exclusive access awaits</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandText}>{SITE_NAME}</Text>
          </Section>

          <Heading style={h1}>
            Welcome{memberName ? `, ${memberName}` : ''}
          </Heading>

          <Text style={text}>
            You have been personally invited to join {SITE_NAME} as {roleLabel}.
            {isAdmin
              ? ' You now have full access to the administration dashboard where you can manage listings, members, and platform operations.'
              : ' You now have access to our exclusive portfolio of luxury accommodations, private drivers, curated experiences, and security services worldwide.'}
          </Text>

          <Section style={detailsBox}>
            <Text style={detailRow}>
              <span style={detailLabel}>Account type:</span> {isAdmin ? 'Administrator' : 'Member'}
            </Text>
            <Text style={detailRow}>
              <span style={detailLabel}>Status:</span> Active
            </Text>
          </Section>

          <Text style={text}>
            To get started, please click the button below to set your password and access your account.
            You will also receive a separate email with a secure link to set up your credentials.
          </Text>

          <Button style={ctaButton} href={loginUrl}>
            Access Your Account
          </Button>

          <Section style={instructionsBox}>
            <Text style={instructionsTitle}>How to set up your account:</Text>
            <Text style={instructionsText}>1. Check your inbox for the invitation email from {SITE_NAME}</Text>
            <Text style={instructionsText}>2. Click the secure link to set your password</Text>
            <Text style={instructionsText}>3. Log in and explore your {isAdmin ? 'dashboard' : 'exclusive services'}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This is an exclusive invitation. If you did not expect this email, you may safely disregard it.
          </Text>
          <Text style={footer}>
            With distinction, The {SITE_NAME} Concierge Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeInvitationEmail,
  subject: (data: Record<string, any>) =>
    data?.role === 'admin'
      ? 'Your Platinum Circle Admin Access Is Ready'
      : 'Welcome to Platinum Circle — Your Exclusive Access Awaits',
  displayName: 'Welcome invitation',
  previewData: {
    memberName: 'Alexandre',
    role: 'member',
    loginUrl: 'https://platinumcircle-vip.lovable.app/auth',
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
const instructionsBox = { backgroundColor: '#faf8f5', padding: '18px 22px', borderRadius: '4px', margin: '0 0 24px' }
const instructionsTitle = { fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#b8963e', margin: '0 0 12px', fontWeight: 'bold' as const }
const instructionsText = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.5', margin: '0 0 6px' }
const ctaButton = { backgroundColor: '#b8963e', color: '#ffffff', padding: '14px 32px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', borderRadius: '4px', display: 'block', textAlign: 'center' as const, margin: '0 auto 30px', fontWeight: 'bold' as const }
const hr = { borderColor: '#e8e5df', margin: '0 0 20px' }
const footer = { fontSize: '13px', color: '#999', lineHeight: '1.5', margin: '0 0 8px' }

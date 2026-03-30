/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {siteName} — confirm your email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>PLATINUM CIRCLE</Text>
        </Section>
        <Heading style={h1}>Welcome Aboard</Heading>
        <Text style={text}>
          Thank you for joining{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Your exclusive membership awaits.
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) to activate your account:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm My Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const brandText = { fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const h1 = { fontSize: '24px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.65', margin: '0 0 22px' }
const link = { color: '#b8963e', textDecoration: 'underline' }
const button = { backgroundColor: '#b8963e', color: '#ffffff', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, borderRadius: '4px', padding: '14px 28px', textDecoration: 'none', display: 'block', textAlign: 'center' as const, margin: '0 auto 28px', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }

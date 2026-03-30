/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>PLATINUM CIRCLE</Text>
        </Section>
        <Heading style={h1}>Verification Code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const brandText = { fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: '#b8963e', fontWeight: 'bold' as const, margin: '0' }
const h1 = { fontSize: '24px', fontWeight: 'normal' as const, color: '#1a1a1a', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.65', margin: '0 0 22px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#b8963e', margin: '0 0 30px', textAlign: 'center' as const, letterSpacing: '0.15em' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }

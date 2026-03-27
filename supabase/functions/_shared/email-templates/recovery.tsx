/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for Activtrim Peptides</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>ACTIVTRIM PEPTIDES</Text>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for Activtrim Peptides. Click
          the button below to choose a new password.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
        <Text style={disclaimer}>For Research Use Only</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: 'hsl(0, 0%, 5%)', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '40px 25px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '14px', fontWeight: 'bold' as const, color: 'hsl(18, 92%, 47%)', letterSpacing: '2px', margin: '0 0 30px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(0, 0%, 95%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(0, 0%, 60%)', lineHeight: '1.5', margin: '0 0 25px' }
const button = { backgroundColor: 'hsl(18, 92%, 47%)', color: 'hsl(0, 0%, 100%)', fontSize: '14px', borderRadius: '8px', padding: '12px 20px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: 'hsl(0, 0%, 40%)', margin: '30px 0 0' }
const disclaimer = { fontSize: '11px', color: 'hsl(0, 0%, 30%)', margin: '15px 0 0', fontStyle: 'italic' as const }

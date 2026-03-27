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
    <Preview>Confirm your email for Activtrim Peptides</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>ACTIVTRIM PEPTIDES</Text>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for creating an account with{' '}
          <Link href={siteUrl} style={link}>
            <strong>Activtrim Peptides</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) by clicking the button below:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <Text style={disclaimer}>For Research Use Only</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: 'hsl(0, 0%, 5%)', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '40px 25px', maxWidth: '480px', margin: '0 auto' }
const brand = { fontSize: '14px', fontWeight: 'bold' as const, color: 'hsl(18, 92%, 47%)', letterSpacing: '2px', margin: '0 0 30px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(0, 0%, 95%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(0, 0%, 60%)', lineHeight: '1.5', margin: '0 0 25px' }
const link = { color: 'hsl(18, 92%, 47%)', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(18, 92%, 47%)', color: 'hsl(0, 0%, 100%)', fontSize: '14px', borderRadius: '8px', padding: '12px 20px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: 'hsl(0, 0%, 40%)', margin: '30px 0 0' }
const disclaimer = { fontSize: '11px', color: 'hsl(0, 0%, 30%)', margin: '15px 0 0', fontStyle: 'italic' as const }

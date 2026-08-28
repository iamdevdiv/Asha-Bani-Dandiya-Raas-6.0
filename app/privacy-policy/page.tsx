'use client';

import React from 'react';
import { Container, Box, Title, Text, Stack, Paper, ThemeIcon, Group, Divider } from '@mantine/core';
import { IconShieldCheck, IconLock } from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <Box className="festive-background">
      <Navbar />

      <Container size="md" py={60}>
        <Paper
          p={{ base: 'lg', md: 'xl' }}
          radius="xl"
          style={{
            backgroundColor: 'rgba(36, 8, 14, 0.8)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}
        >
          <Stack gap="md">
            <Group gap="sm" wrap="nowrap" align="center">
              <ThemeIcon size={40} radius="md" color="yellow" variant="light" style={{ flexShrink: 0 }}>
                <IconShieldCheck size={24} />
              </ThemeIcon>
              <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", flex: 1, minWidth: 0, wordBreak: 'break-word', fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)' }}>
                Privacy Policy
              </Title>
            </Group>

            <Text size="sm" c="gray.3">
              Last updated: August 2026
            </Text>

            <Divider color="rgba(234, 179, 8, 0.2)" />

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              1. Information We Collect
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              When reserving a stall or purchasing an event pass on Asha Bani Dandiya Raas, we collect personal information such as your name, mobile number, email address, brand/business details, and transaction reference numbers necessary to fulfill your booking and generate your digital QR pass.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              2. How Your Information is Used
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              Your data is strictly utilized to issue exhibitor passes, verify entry credentials at the venue gates, communicate vital event updates, and provide coordinator assistance. We do not sell, rent, or lease your personal data to third parties.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              3. Payment Security &amp; Razorpay Processing
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              Payment details such as credit card, UPI, and net banking credentials are handled directly through Razorpay payment gateway using bank-grade encryption and PCI-DSS compliance. We do not store sensitive payment card details on our servers.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              4. Data Retention &amp; Inquiries
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              If you have any questions or require data modification regarding your booking record, please contact our team at contact@ashabani.com or +91 6399063455.
            </Text>
          </Stack>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}

'use client';

import React from 'react';
import { Container, Box, Title, Text, Stack, Paper, ThemeIcon, Group, Divider } from '@mantine/core';
import { IconReceiptRefund, IconAlertCircle, IconPhoneCall } from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RefundPolicyPage() {
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
                <IconReceiptRefund size={24} />
              </ThemeIcon>
              <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", flex: 1, minWidth: 0, wordBreak: 'break-word', fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)' }}>
                Cancellation &amp; Refund Policy
              </Title>
            </Group>

            <Text size="sm" c="gray.3">
              Last updated: August 2026
            </Text>

            <Divider color="rgba(234, 179, 8, 0.2)" />

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              1. Non-Refundable Stall Allotment Policy
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              All stall bookings and exhibitor spaces reserved for <strong>Asha Bani Dandiya Raas 6.0 (2026)</strong> are strictly non-refundable and non-cancellable once confirmed and paid for. Because stall layouts, electricity planning, tables, and promotional materials are provisioned in advance based on confirmed reservations, no refunds or chargebacks will be issued under any circumstances.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              2. Transferability
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              Stall allotments are tied to the registered brand name and contact person. In exceptional circumstances where a registered exhibitor cannot attend, a written request to transfer the stall to another approved brand must be submitted to the organizing committee at least 7 days prior to the event date. The organizer reserves final discretion to approve or reject transfer requests.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              3. Event Rescheduling or Force Majeure
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              If the event is rescheduled due to unforeseen circumstances, severe weather, governmental directives, or force majeure events, confirmed stall allotments will automatically roll over to the rescheduled date. No monetary refunds will be issued.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              4. Contact for Inquiries
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              For any clarifications regarding your booking receipt or event participation, please reach our helpdesk at <strong>+91 6399063455</strong> or email <strong>contact@ashabani.com</strong>.
            </Text>
          </Stack>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}

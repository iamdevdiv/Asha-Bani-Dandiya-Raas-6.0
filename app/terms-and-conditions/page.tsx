'use client';

import React from 'react';
import { Container, Box, Title, Text, Stack, Paper, ThemeIcon, Group, Divider, List } from '@mantine/core';
import { IconFileText, IconShieldCheck } from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsAndConditionsPage() {
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
                <IconFileText size={24} />
              </ThemeIcon>
              <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", flex: 1, minWidth: 0, wordBreak: 'break-word', fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)' }}>
                Terms and Conditions
              </Title>
            </Group>

            <Text size="sm" c="gray.3">
              Last updated: August 2026
            </Text>

            <Divider color="rgba(234, 179, 8, 0.2)" />

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              1. Overview
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              Welcome to Asha Bani Dandiya Raas 2026 (6th Grand Dandiya Celebration). By accessing our website, booking a stall, or acquiring an entry pass, you agree to adhere to and be bound by the following terms, conditions, and regulations set forth by the organizing committee.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              2. Stall Allotment &amp; Vendor Regulations
            </Title>
            <List spacing="xs" size="sm" c="gray.3">
              <List.Item>Each standard stall includes 2 display tables and 1 space allocation.</List.Item>
              <List.Item>2 official passes are issued per stall booking. Extra staff or crew passes are chargeable.</List.Item>
              <List.Item>Stall setup entry begins at 4:00 PM on 13 October 2026. All stalls must be fully prepared by 5:30 PM.</List.Item>
              <List.Item>Event timings are from 6:00 PM to 12:00 AM.</List.Item>
              <List.Item>Exhibitors are responsible for their own merchandise, cash, and personal belongings. Organizers are not liable for loss, theft, or physical damage.</List.Item>
              <List.Item>Exhibitors must maintain event discipline, safety standards, and cleanliness within their allotted zone.</List.Item>
            </List>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              3. Entry Passes &amp; Admission
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              Entry to the event premises at Maharaja Agrasen Bhavan, Saharanpur, is strictly by valid digital or physical pass. The organizer reserves the right of admission and may refuse entry to individuals failing to present valid identification or violating event decorum.
            </Text>

            <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              4. Payment &amp; Transactions
            </Title>
            <Text size="sm" c="gray.3" style={{ lineHeight: 1.7 }}>
              All online transactions are processed through Razorpay secure gateway in Indian Rupees (INR). By completing payment, you confirm that you are authorized to use the chosen payment method and accept our non-refundable policy.
            </Text>
          </Stack>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}

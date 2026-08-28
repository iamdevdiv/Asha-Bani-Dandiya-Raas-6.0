'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Container,
  SimpleGrid,
  Stack,
  Text,
  Group,
  Anchor,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconBrandInstagram,
  IconPhone,
  IconMapPin,
  IconMail,
  IconSparkles,
} from '@tabler/icons-react';

export function Footer() {
  return (
    <Box
      component="footer"
      style={{
        backgroundColor: '#0a0103',
        borderTop: '1px solid rgba(234, 179, 8, 0.25)',
        paddingTop: 50,
        paddingBottom: 30,
        marginTop: 60,
      }}
    >
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {/* Col 1: About Event */}
          <Box>
            <Stack gap="sm">
              <Group gap="xs" wrap="nowrap" align="center">
                <Box
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(234, 179, 8, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    backgroundColor: '#140305',
                  }}
                >
                  <Image
                    src="/icon1.png"
                    alt="Asha Bani Dandiya Raas Logo"
                    fill
                    sizes="34px"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
                <Text
                  fw={800}
                  size="md"
                  className="gold-gradient-text"
                  style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em', flex: 1, minWidth: 0 }}
                >
                  ASHA BANI DANDIYA RAAS 6.0
                </Text>
              </Group>
              <Text size="sm" c="gray.4" style={{ lineHeight: 1.6 }}>
                Join us for the 6th edition of the most grand and auspicious Dandiya celebration in Saharanpur. An unforgettable evening of rhythm, festive joy, shopping, and culinary delights.
              </Text>
            </Stack>
          </Box>

          {/* Col 2: Event & Venue Info */}
          <Box>
            <Stack gap="sm">
              <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.08em' }}>
                EVENT DETAILS
              </Text>
              <Group gap="xs" wrap="nowrap" align="flex-start">
                <IconMapPin size={18} color="#facc15" style={{ flexShrink: 0, marginTop: 3 }} />
                <Text size="sm" c="gray.3" style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', lineHeight: 1.5 }}>
                  Maharaja Agrasen Bhavan, Aggarwal Dharamshala, Saharanpur
                </Text>
              </Group>
              <Group gap="xs" wrap="nowrap" align="center">
                <IconPhone size={18} color="#facc15" style={{ flexShrink: 0 }} />
                <Anchor href="tel:+916399063455" size="sm" c="gray.3" style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                  +91 6399063455
                </Anchor>
              </Group>
              <Group gap="xs" wrap="nowrap" align="center">
                <IconBrandInstagram size={18} color="#facc15" style={{ flexShrink: 0 }} />
                <Anchor
                  href="https://www.instagram.com/asha_bani_dandiya_raas_6.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  c="royalGold.3"
                  style={{ flex: 1, minWidth: 0, wordBreak: 'break-all' }}
                >
                  @asha_bani_dandiya_raas_6.0
                </Anchor>
              </Group>
            </Stack>
          </Box>

          {/* Col 3: Quick Links & Policies */}
          <Box>
            <Stack gap="xs">
              <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.08em' }}>
                POLICIES &amp; COMPLIANCE
              </Text>
              <Anchor component={Link} href="/dandiyaraas/stall" size="sm" c="gray.4">
                Stall Exhibitor Info
              </Anchor>
              <Anchor component={Link} href="/dandiyaraas/stall/book" size="sm" c="gray.4">
                Interactive Stall Booking
              </Anchor>
              <Anchor component={Link} href="/terms-and-conditions" size="sm" c="gray.4">
                Terms and Conditions
              </Anchor>
              <Anchor component={Link} href="/refund-policy" size="sm" c="gray.4">
                Cancellation &amp; Refund Policy
              </Anchor>
              <Anchor component={Link} href="/privacy-policy" size="sm" c="gray.4">
                Privacy Policy
              </Anchor>
              <Anchor component={Link} href="/contact" size="sm" c="gray.4">
                Contact &amp; Support
              </Anchor>
            </Stack>
          </Box>
        </SimpleGrid>

        <Divider my="xl" color="rgba(234, 179, 8, 0.15)" />

        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text size="xs" c="dimmed">
            © 2026 Asha Bani Dandiya Raas. All rights reserved.
          </Text>
          <Text size="xs" c="dimmed">
            Powered by secure Razorpay payment gateway
          </Text>
        </Group>
      </Container>
    </Box>
  );
}

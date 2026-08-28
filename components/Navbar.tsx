'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Container,
  Group,
  Button,
  Text,
  Box,
  Burger,
  Drawer,
  Stack,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBuildingStore,
  IconTicket,
  IconSparkles,
  IconPhoneCall,
  IconShieldLock,
} from '@tabler/icons-react';

export function Navbar() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  const isCustomerHome = pathname === '/dandiyaraas';
  const isStallPage = pathname.startsWith('/dandiyaraas/stall');

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 3, 5, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(234, 179, 8, 0.25)',
      }}
    >
      <Container size="xl" py="sm">
        <Group justify="space-between" align="center">
          {/* Logo & Title */}
          <Link href="/dandiyaraas" style={{ textDecoration: 'none' }}>
            <Group gap="xs" align="center" wrap="nowrap">
              <Box
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(234, 179, 8, 0.6)',
                  boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)',
                  flexShrink: 0,
                  position: 'relative',
                  backgroundColor: '#140305',
                }}
              >
                <Image
                  src="/icon1.png"
                  alt="Asha Bani Dandiya Raas Logo"
                  fill
                  sizes="38px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Box>
                <Text
                  size="sm"
                  fw={800}
                  className="gold-gradient-text"
                  style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em', lineHeight: 1.1 }}
                >
                  ASHA BANI
                </Text>
                <Text
                  size="xs"
                  c="dimmed"
                  fw={600}
                  style={{ letterSpacing: '0.08em', fontSize: '0.65rem' }}
                >
                  DANDIYA RAAS 6.0
                </Text>
              </Box>
            </Group>
          </Link>

          {/* Desktop Navigation Links */}
          <Group gap="md" visibleFrom="md">
            <Button
              component={Link}
              href="/dandiyaraas"
              variant={isCustomerHome ? 'light' : 'subtle'}
              color="royalGold"
              radius="md"
              size="sm"
            >
              Event Highlights
            </Button>

            <Button
              component={Link}
              href="/dandiyaraas/stall"
              variant={isStallPage ? 'light' : 'subtle'}
              color="royalGold"
              radius="md"
              size="sm"
              leftSection={<IconBuildingStore size={16} />}
            >
              Stall Exhibitors
            </Button>

            <Button
              component={Link}
              href="/contact"
              variant="subtle"
              color="royalGold"
              radius="md"
              size="sm"
              leftSection={<IconPhoneCall size={16} />}
            >
              Contact
            </Button>
          </Group>

          {/* CTA Link */}
          <Group gap="sm" visibleFrom="sm">
            <Button
              component={Link}
              href="/dandiyaraas/stall/book"
              className="btn-auspicious-gold"
              size="sm"
              leftSection={<IconBuildingStore size={18} />}
            >
              Book a Stall
            </Button>
          </Group>

          {/* Mobile Menu Trigger */}
          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" color="#facc15" />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title={
          <Text fw={700} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            Asha Bani Dandiya Raas
          </Text>
        }
        styles={{
          content: {
            backgroundColor: '#140305',
            borderLeft: '1px solid rgba(234, 179, 8, 0.3)',
          },
          header: {
            backgroundColor: '#140305',
            borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
          },
        }}
      >
        <Stack gap="md" mt="md">
          <Button
            component={Link}
            href="/dandiyaraas"
            onClick={close}
            variant={isCustomerHome ? 'light' : 'subtle'}
            color="royalGold"
            fullWidth
            justify="start"
          >
            Event Highlights
          </Button>

          <Button
            component={Link}
            href="/dandiyaraas/stall"
            onClick={close}
            variant={isStallPage ? 'light' : 'subtle'}
            color="royalGold"
            fullWidth
            justify="start"
            leftSection={<IconBuildingStore size={18} />}
          >
            Stall Exhibitors
          </Button>

          <Button
            component={Link}
            href="/dandiyaraas/stall/book"
            onClick={close}
            className="btn-auspicious-gold"
            fullWidth
            leftSection={<IconBuildingStore size={18} />}
          >
            Book Your Stall
          </Button>

          <Button
            component={Link}
            href="/contact"
            onClick={close}
            variant="subtle"
            color="royalGold"
            fullWidth
            justify="start"
            leftSection={<IconPhoneCall size={18} />}
          >
            Contact & Support
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}

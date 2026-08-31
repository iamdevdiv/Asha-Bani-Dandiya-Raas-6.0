'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  Badge,
  Alert,
  Loader,
  Center,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingStore,
  IconCopy,
  IconAlertTriangle,
  IconCheck,
  IconArrowLeft,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CustomerPassCard } from '@/components/CustomerPassCard';

export default function TicketPassPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const passId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/tickets/${passId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.booking) {
          setBooking(data.booking);
        } else {
          notifications.show({
            title: 'Not Found',
            message: data.message || 'Ticket booking pass not found.',
            color: 'red',
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching ticket pass:', err);
        notifications.show({
          title: 'Network Error',
          message: 'Could not load ticket pass details.',
          color: 'red',
        });
      })
      .finally(() => setLoading(false));
  }, [passId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopied(true);
      notifications.show({
        title: 'Link Copied',
        message: 'Your unique ticket pass link has been copied to clipboard.',
        color: 'green',
      });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Center>
          <Stack align="center" gap="sm">
            <Loader color="royalGold" size="lg" />
            <Text c="gray.4" size="sm" fw={600}>
              Loading your festive entry pass...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container size="sm" py={80} style={{ flexGrow: 1, textAlign: 'center' }}>
          <Alert color="red" title="Ticket Pass Not Found" icon={<IconAlertTriangle size={24} />}>
            We could not locate this ticket pass. Please verify the URL or contact event organizers.
          </Alert>
          <Button component={Link} href="/dandiyaraas" mt="lg" className="btn-auspicious-gold">
            Return to Home
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container size="sm" py={50} style={{ flexGrow: 1 }}>
        <Stack gap="xl" align="center">
          {/* Top Bar */}
          <Group justify="space-between" align="center" w="100%" maw={480}>
            <Button
              component={Link}
              href="/dandiyaraas"
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              size="xs"
            >
              Event Home
            </Button>
            <Badge color="green" variant="filled" size="lg">
              ✓ CONFIRMED PASS
            </Badge>
          </Group>

          {/* Success Title */}
          <Box ta="center">
            <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.15em' }}>
              BOOKING CONFIRMATION
            </Text>
            <Title
              order={1}
              className="gold-gradient-text"
              mt={4}
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}
            >
              Your Dandiya Pass is Ready!
            </Title>
            <Text size="sm" c="gray.3" mt={6}>
              Booking ID: <b style={{ color: '#fde047', fontFamily: 'monospace' }}>{booking.bookingNumber}</b>
            </Text>
          </Box>

          {/* Official Customer Pass Card with html2canvas download */}
          <CustomerPassCard booking={booking} showDownloadButton={true} />

          {/* Included Free Voucher Action Card */}
          <Paper
            p="md"
            radius="lg"
            w="100%"
            maw={480}
            style={{
              background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.2) 0%, rgba(20, 3, 5, 0.9) 100%)',
              border: '1px solid rgba(250, 204, 21, 0.4)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Group gap="sm">
                <ThemeIcon size={36} radius="md" color="yellow" variant="filled">
                  <IconBuildingStore size={20} color="#140305" />
                </ThemeIcon>
                <Box>
                  <Group gap="xs" align="center">
                    <Text size="xs" fw={700} c="royalGold.3">
                      INCLUDED STALL VOUCHER
                    </Text>
                    <Badge size="xs" color="yellow" variant="light">
                      {booking.voucherApplicableTo === 'food'
                        ? 'Food Stalls (1–15)'
                        : booking.voucherApplicableTo === 'other'
                        ? 'Commercial Stalls (A–T)'
                        : 'All 35 Stalls'}
                    </Badge>
                  </Group>
                  <Text size="sm" c="white" fw={600} mt={2}>
                    Available Balance: <span style={{ color: '#facc15' }}>₹{booking.voucherBalance}</span>
                  </Text>
                </Box>
              </Group>

              <Button
                component={Link}
                href={`/dandiyaraas/tickets/voucher/${booking.id}`}
                size="sm"
                className="btn-auspicious-gold"
                leftSection={<IconBuildingStore size={18} />}
              >
                Use Stall Voucher (₹{booking.voucherBalance})
              </Button>
            </Group>
          </Paper>

          {/* Pass Action Buttons */}
          <Paper
            p="md"
            radius="lg"
            w="100%"
            maw={480}
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.7)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <Group justify="center" gap="md" wrap="wrap">
              <Button
                variant="light"
                color="gray"
                onClick={handleCopyLink}
                leftSection={copied ? <IconCheck size={18} color="#4ade80" /> : <IconCopy size={18} />}
                fullWidth
              >
                {copied ? 'Link Copied to Clipboard!' : 'Copy Pass Link'}
              </Button>
            </Group>
          </Paper>

          {/* Strict Security Disclaimer */}
          <Alert
            icon={<IconAlertTriangle size={20} />}
            color="red"
            radius="md"
            variant="light"
            w="100%"
            maw={480}
          >
            <Text size="xs" fw={600} c="red.2">
              <b>Security Notice:</b> Please do not share your unique pass URL or QR code with untrusted persons. Anyone with access to this link can use it for venue entry or redeem your stall voucher balance.
            </Text>
          </Alert>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}

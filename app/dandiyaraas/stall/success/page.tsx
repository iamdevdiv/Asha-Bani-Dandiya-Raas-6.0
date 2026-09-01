'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Loader,
  ThemeIcon,
  SimpleGrid,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconPhoneCall,
  IconBuildingStore,
  IconArrowLeft,
  IconShieldCheck,
  IconMapPin,
  IconCalendarEvent,
  IconClock,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ExhibitorPassCard } from '@/components/ExhibitorPassCard';
import { StallVoucherLiveFeed } from '@/components/StallVoucherLiveFeed';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/stalls/booking/${bookingId}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.booking);
        }
      } catch (err) {
        console.error('Error fetching booking pass:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <Container size="md" py={100} style={{ textAlign: 'center' }}>
        <Loader color="royalGold" size="xl" />
        <Text mt="md" c="gray.3">
          Loading your official stall allotment details...
        </Text>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container size="md" py={80} style={{ textAlign: 'center' }}>
        <Paper p="xl" radius="lg" style={{ backgroundColor: 'rgba(36, 8, 14, 0.8)' }}>
          <Title order={2} c="white" mb="sm">
            Booking Information Not Found
          </Title>
          <Text c="gray.4" mb="lg">
            We could not retrieve the booking reference. If you recently completed payment, please contact our support team.
          </Text>
          <Button component={Link} href="/dandiyaraas/stall" className="btn-auspicious-gold">
            Return to Stall Portal
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py={50}>
      {/* Top Banner */}
      <Stack align="center" gap="xs" mb={35} ta="center">
        <ThemeIcon size={60} radius="50%" color="green" variant="light">
          <IconCircleCheck size={38} color="#4ade80" />
        </ThemeIcon>
        <Badge color="green" size="lg" variant="filled">
          PAYMENT CONFIRMED &amp; ALLOTTED
        </Badge>
        <Title
          order={1}
          className="gold-gradient-text"
          style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}
        >
          Congratulations! Stall {booking.stallNumber} is Confirmed
        </Title>
        <Text size="md" c="gray.3" maw={650}>
          Your stall has been officially reserved for Asha Bani Dandiya Raas 2026. Please save or download your official digital pass below.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb="xl" style={{ alignItems: 'start' }}>
        {/* Left Column: Official Exhibitor Pass Card */}
        <Box style={{ display: 'flex', justifyContent: 'center' }}>
          <ExhibitorPassCard booking={booking} showDownloadButton={true} />
        </Box>

        {/* Right Column: Venue, Setup Logistics & Helpline Assistance */}
        <Stack gap="md">
          {/* Logistics & Timing Card */}
          <Paper
            p="xl"
            radius="xl"
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Title order={3} size="h4" c="white" mb="md" style={{ fontFamily: "'Cinzel', serif" }}>
              Event Schedule &amp; Setup Details
            </Title>

            <Stack gap="sm">
              <Group gap="xs" wrap="nowrap" align="start">
                <IconCalendarEvent size={18} color="#facc15" style={{ flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Text size="xs" fw={700} c="royalGold.3">EVENT DATE</Text>
                  <Text size="sm" fw={700} c="white">Tuesday, 13 October 2026</Text>
                </Box>
              </Group>

              <Group gap="xs" wrap="nowrap" align="start">
                <IconClock size={18} color="#facc15" style={{ flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Text size="xs" fw={700} c="royalGold.3">TIMINGS</Text>
                  <Text size="sm" c="white">Vendor Advance Setup: <strong>4:00 PM</strong></Text>
                  <Text size="xs" c="gray.3">Grand Dandiya Hours: <strong>6:00 PM – 12:00 AM</strong></Text>
                </Box>
              </Group>

              <Group gap="xs" wrap="nowrap" align="start">
                <IconMapPin size={18} color="#facc15" style={{ flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Text size="xs" fw={700} c="royalGold.3">VENUE LOCATION</Text>
                  <Text size="sm" fw={700} c="white">Maharaja Agrasen Bhavan</Text>
                  <Text size="xs" c="gray.3">Aggarwal Dharamshala, Saharanpur</Text>
                </Box>
              </Group>
            </Stack>
          </Paper>

          {/* Allotment Terms & Passes Notice */}
          <Paper
            p="xl"
            radius="xl"
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Title order={3} size="h4" c="white" mb="sm" style={{ fontFamily: "'Cinzel', serif" }}>
              Exhibitor Pass Guidelines
            </Title>
            <Stack gap="xs">
              <Text size="xs" c="gray.2" style={{ lineHeight: 1.6 }}>
                • <strong>Entry Passes:</strong> Strictly 2 official exhibitor passes are included with this allotment.
              </Text>
              <Text size="xs" c="gray.2" style={{ lineHeight: 1.6 }}>
                • <strong>Verification at Gate:</strong> Keep your digital QR pass ready on your mobile or printout. Our gate verifiers will scan this QR at entry.
              </Text>
              <Text size="xs" c="gray.2" style={{ lineHeight: 1.6 }}>
                • <strong>Non-Transferable:</strong> Each pass is digitally serialized and can be scanned for verification once at the entry gate.
              </Text>
            </Stack>

            {/* Helpline Assistance Box */}
            <Paper
              p="sm"
              radius="md"
              mt="md"
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Group gap="xs" wrap="nowrap">
                  <IconPhoneCall size={18} color="#facc15" style={{ flexShrink: 0 }} />
                  <Box>
                    <Text size="xs" fw={700} c="royalGold.3">Need Help or Additional Passes?</Text>
                    <Text size="sm" fw={800} c="white">+91 6399063455</Text>
                  </Box>
                </Group>

                <Button
                  component="a"
                  href="tel:+916399063455"
                  size="xs"
                  variant="outline"
                  color="royalGold"
                >
                  Call Helpline
                </Button>
              </Group>
            </Paper>
          </Paper>
        </Stack>
      </SimpleGrid>

      {/* Live Voucher Settlements & Payments Received Section */}
      <Box mb="xl">
        <StallVoucherLiveFeed
          bookingId={booking.id}
          stallNumber={booking.stallNumber}
          brandName={booking.brandName || booking.bookerName}
        />
      </Box>

      {/* Navigation Buttons */}
      <Group justify="center" gap="md" mt="xl">
        <Button
          component={Link}
          href="/dandiyaraas"
          variant="subtle"
          color="royalGold"
          leftSection={<IconArrowLeft size={18} />}
        >
          Back to Event Home
        </Button>
        <Button
          component={Link}
          href="/dandiyaraas/stall"
          variant="light"
          color="royalGold"
          leftSection={<IconBuildingStore size={18} />}
        >
          View Stall Portal
        </Button>
      </Group>
    </Container>
  );
}

export default function BookingSuccessPage() {
  return (
    <Box className="festive-background">
      <Navbar />
      <Suspense
        fallback={
          <Container size="md" py={100} style={{ textAlign: 'center' }}>
            <Loader color="royalGold" size="xl" />
          </Container>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </Box>
  );
}

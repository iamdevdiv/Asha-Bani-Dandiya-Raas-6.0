'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Group,
  SimpleGrid,
  Card,
  ThemeIcon,
  Stack,
  Badge,
  Paper,
  Divider,
} from '@mantine/core';
import {
  IconDisc,
  IconToolsKitchen2,
  IconShoppingBag,
  IconSparkles,
  IconConfetti,
  IconFirstAidKit,
  IconCalendarEvent,
  IconMapPin,
  IconPhoneCall,
  IconAlertCircle,
  IconBrandInstagram,
  IconBuildingStore,
  IconTicket,
  IconArrowRight,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DEFAULT_SETTINGS } from '@/lib/stall-data';

export default function CustomerHomePage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.warn('Could not fetch dynamic settings:', err));
  }, []);

  const bookingNotice = settings.ticket_booking_msg || 'Ticket bookings start from 1 September 2026';
  const eventDate = settings.event_date || '13 October 2026';
  const venueName = settings.venue_name || 'Maharaja Agrasen Bhavan';
  const venueAddress = settings.venue_address || 'Aggarwal Dharamshala, Saharanpur';
  const contactPhone = settings.contact_phone || '+91 6399063455';
  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/asha_bani_dandiya_raas_6.0';

  const highlights = [
    {
      title: 'Best DJ in Town',
      desc: 'Electrifying soundscapes, live folk percussion, and non-stop garba rhythms by top artists.',
      icon: <IconDisc size={28} color="#facc15" />,
      tag: 'Live Music',
    },
    {
      title: 'Mouth-watering Food',
      desc: 'A vibrant food street serving authentic Gujarati delicacies, chaat, desserts, and festival snacks.',
      icon: <IconToolsKitchen2 size={28} color="#facc15" />,
      tag: 'Cuisine',
    },
    {
      title: 'Shopping Stalls',
      desc: 'Explore curated boutique stalls featuring festive ethnic wear, designer jewellery, and handicrafts.',
      icon: <IconShoppingBag size={28} color="#facc15" />,
      tag: 'Exhibition',
    },
    {
      title: 'Garba and Dandiya',
      desc: 'Immerse yourself in traditional raas circles, energetic group moves, and joyful Dandiya rounds.',
      icon: <IconSparkles size={28} color="#facc15" />,
      tag: 'Tradition',
    },
    {
      title: '6th Year Celebration',
      desc: 'A milestone grand anniversary production with enhanced stage design, lasers, and prizes.',
      icon: <IconConfetti size={28} color="#facc15" />,
      tag: 'Grand Edition',
    },
    {
      title: 'Emergency Medical Facility Available',
      desc: 'Dedicated on-site first-aid stations and trained emergency response staff for your safety.',
      icon: <IconFirstAidKit size={28} color="#facc15" />,
      tag: 'Safety First',
    },
  ];

  return (
    <Box className="festive-background">
      <Navbar />

      {/* HERO SECTION */}
      <Box
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '80px 20px',
        }}
      >
        {/* Background Image with Richer Opacity */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            opacity: 0.6,
          }}
        >
          <Image
            src="/images/hero.jpg"
            alt="Asha Bani Dandiya Raas 2026 Celebration"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </Box>

        {/* Ambient Gradient Overlays */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            background:
              'radial-gradient(circle at 50% 30%, rgba(42, 8, 12, 0.45) 0%, rgba(13, 2, 4, 0.75) 80%, #0d0204 100%)',
          }}
        />

        {/* Content Container */}
        <Container size="md" style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
          <Stack align="center" gap="lg">
            {/* Auspicious Badge */}
            <Badge
              size="lg"
              variant="outline"
              color="royalGold"
              radius="xl"
              style={{
                borderColor: '#facc15',
                color: '#fef08a',
                padding: '12px 20px',
                letterSpacing: '0.12em',
                fontSize: '0.85rem',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
              }}
            >
              FESTIVAL OF TRADITION &amp; TOGETHERNESS
            </Badge>

            {/* Overlaid Title */}
            <Text
              size="lg"
              fw={700}
              c="royalGold.3"
              style={{
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.2em',
                fontSize: '1.25rem',
              }}
            >
              ASHA BANI DANDIYA RAAS PRESENTS
            </Text>

            <Title
              order={1}
              className="gold-gradient-text"
              style={{
                fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
                fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
                lineHeight: 1.15,
                fontWeight: 900,
                textShadow: '0 4px 25px rgba(234, 179, 8, 0.35)',
              }}
            >
              6th Grand Dandiya Celebration
            </Title>

            <Text
              size="xl"
              c="gray.2"
              fw={500}
              style={{
                maxWidth: 650,
                lineHeight: 1.5,
                fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
              }}
            >
              6 Years of Joy, Music &amp; Togetherness
            </Text>

            {/* Action Section */}
            <Paper
              p="md"
              radius="lg"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                backdropFilter: 'blur(10px)',
                marginTop: 15,
                maxWidth: 520,
                width: '100%',
              }}
            >
              <Stack gap="xs" align="center">
                <Badge color="red" variant="filled" size="md">
                  ANNOUNCEMENT
                </Badge>
                <Text fw={600} size="sm" c="yellow.2" ta="center">
                  {bookingNotice}
                </Text>
                <Group justify="center" gap="sm" mt="xs">
                  <Button
                    className="btn-auspicious-gold"
                    size="md"
                    leftSection={<IconTicket size={20} />}
                    disabled
                  >
                    Ticket Booking Opens 1 Sept
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* WHAT'S IN STORE FOR YOU? SECTION */}
      <Box py={80} style={{ borderTop: '1px solid rgba(234, 179, 8, 0.15)' }}>
        <Container size="xl">
          <Stack align="center" gap="xs" mb={50}>
            <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.15em' }}>
              EVENT EXPERIENCES
            </Text>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}
            >
              What&apos;s in Store for You?
            </Title>
            <Text c="gray.4" size="md" ta="center" maw={600}>
              Immerse yourself in six unforgettable highlights crafted to bring family, friends, and community together in celebration.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {highlights.map((item, idx) => (
              <Card key={idx} className="festive-card" p="xl">
                <Group justify="space-between" align="flex-start" mb="md">
                  <ThemeIcon
                    size={52}
                    radius="md"
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                    }}
                  >
                    {item.icon}
                  </ThemeIcon>
                  <Badge variant="light" color="royalGold" size="sm">
                    {item.tag}
                  </Badge>
                </Group>

                <Title
                  order={3}
                  size="h4"
                  c="gray.1"
                  mb="xs"
                  style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}
                >
                  {item.title}
                </Title>
                <Text size="sm" c="gray.4" style={{ lineHeight: 1.6 }}>
                  {item.desc}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* EVENT DETAILS & LOCATION SECTION */}
      <Box
        py={70}
        style={{
          background: 'linear-gradient(180deg, rgba(30, 7, 12, 0.6) 0%, rgba(13, 2, 4, 0.9) 100%)',
          borderTop: '1px solid rgba(234, 179, 8, 0.2)',
          borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xs" mb={40}>
            <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.15em' }}>
              SCHEDULE &amp; VENUE
            </Text>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Event Details
            </Title>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
            {/* Date Card */}
            <Paper
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                textAlign: 'center',
              }}
            >
              <ThemeIcon size={48} radius="50%" color="royalGold" variant="light" mx="auto" mb="sm">
                <IconCalendarEvent size={26} />
              </ThemeIcon>
              <Text fw={700} size="xs" c="royalGold.4" style={{ letterSpacing: '0.08em' }}>
                EVENT DATE
              </Text>
              <Title order={3} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                {eventDate}
              </Title>
              <Text size="xs" c="dimmed" mt={4}>
                Evening 6:00 PM onwards
              </Text>
            </Paper>

            {/* Venue Card */}
            <Paper
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                textAlign: 'center',
              }}
            >
              <ThemeIcon size={48} radius="50%" color="royalGold" variant="light" mx="auto" mb="sm">
                <IconMapPin size={26} />
              </ThemeIcon>
              <Text fw={700} size="xs" c="royalGold.4" style={{ letterSpacing: '0.08em' }}>
                VENUE
              </Text>
              <Title order={3} size="h4" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                {venueName}
              </Title>
              <Text size="xs" c="gray.3" mt={4}>
                {venueAddress}
              </Text>
            </Paper>

            {/* Contact Card */}
            <Paper
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                textAlign: 'center',
              }}
            >
              <ThemeIcon size={48} radius="50%" color="royalGold" variant="light" mx="auto" mb="sm">
                <IconPhoneCall size={26} />
              </ThemeIcon>
              <Text fw={700} size="xs" c="royalGold.4" style={{ letterSpacing: '0.08em' }}>
                ORGANIZER HELPLINE
              </Text>
              <Title order={3} size="h4" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                {contactPhone}
              </Title>
              <Text size="xs" c="dimmed" mt={4}>
                Calls &amp; WhatsApp inquiries
              </Text>
            </Paper>
          </SimpleGrid>

          {/* Important Entry Note */}
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: 'rgba(127, 29, 29, 0.35)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
            }}
          >
            <Group justify="center" gap="sm" wrap="nowrap" align="center">
              <IconAlertCircle size={22} color="#f87171" style={{ flexShrink: 0 }} />
              <Text fw={600} size="sm" c="red.2" ta="center" style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                Important Note: Entry will strictly not be permitted without a valid official pass.
              </Text>
            </Group>
          </Paper>
        </Container>
      </Box>

      {/* INSTAGRAM COMMUNITY SECTION */}
      <Box py={70}>
        <Container size="md">
          <Paper
            p={{ base: 'xl', md: 50 }}
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.3) 0%, rgba(190, 18, 60, 0.3) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            <Stack align="center" gap="md">
              <ThemeIcon
                size={64}
                radius="50%"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                }}
              >
                <IconBrandInstagram size={36} color="#ffffff" />
              </ThemeIcon>

              <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
                Follow Our Official Instagram
              </Title>

              <Text c="gray.3" size="md" maw={500} style={{ lineHeight: 1.6 }}>
                Get daily artist reveals, venue setup sneak peeks, countdown updates, and tag us in your Dandiya celebration moments.
              </Text>

              <Button
                component="a"
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="btn-auspicious-gold"
                leftSection={<IconBrandInstagram size={22} style={{ flexShrink: 0 }} />}
                rightSection={<IconArrowRight size={18} style={{ flexShrink: 0 }} />}
                maw="100%"
                style={{
                  height: 'auto',
                  padding: '12px 20px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                }}
              >
                Follow @asha_bani_dandiya_raas_6.0
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* STALL PROMOTION BANNER */}
      <Box pb={60}>
        <Container size="xl">
          <Paper
            p="xl"
            radius="lg"
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="lg">
              <Box maw={600}>
                <Badge color="royalGold" variant="filled" size="sm" mb="xs">
                  EXHIBITOR REGISTRATION OPEN
                </Badge>
                <Title order={3} c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                  Are you a Brand or Food Vendor?
                </Title>
                <Text size="sm" c="gray.3" mt={4}>
                  Book your prime commercial or food stall now. Select your exact canopy location on our live interactive map.
                </Text>
              </Box>

              <Button
                component={Link}
                href="/dandiyaraas/stall"
                size="lg"
                className="btn-auspicious-gold"
                leftSection={<IconBuildingStore size={20} />}
              >
                Explore Stall Opportunities
              </Button>
            </Group>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

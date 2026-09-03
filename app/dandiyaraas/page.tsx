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
  IconGift,
  IconCalendar,
  IconTrophy,
  IconCrown,
  IconFlame,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DEFAULT_SETTINGS, INITIAL_TICKET_PHASES } from '@/lib/stall-data';

export default function CustomerHomePage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [allPhases, setAllPhases] = useState<any[]>(INITIAL_TICKET_PHASES);
  const [currentPhase, setCurrentPhase] = useState<any>(INITIAL_TICKET_PHASES[0]);
  const [isSalesOpen, setIsSalesOpen] = useState<boolean>(() => {
    try {
      const startDate = DEFAULT_SETTINGS.ticket_booking_start_date || '2026-09-01';
      const startTime = DEFAULT_SETTINGS.ticket_booking_start_time || '00:00';
      const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const [tH, tM] = startTime.split(':').map(Number);
      const openTarget = new Date(`${startDate}T${String(tH || 0).padStart(2, '0')}:${String(tM || 0).padStart(2, '0')}:00+05:30`);
      return istNow.getTime() >= openTarget.getTime();
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // 1. Capture and persist referral code if present in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        localStorage.setItem('asha_ref', refCode.trim());
      }
    }

    // 2. Fetch dynamic settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);

          // Evaluate IST Date/Time
          const startDate = data.settings.ticket_booking_start_date || '2026-09-01';
          const startTime = data.settings.ticket_booking_start_time || '00:00';
          const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
          
          const [tH, tM] = startTime.split(':').map(Number);
          const openTarget = new Date(`${startDate}T${String(tH || 0).padStart(2, '0')}:${String(tM || 0).padStart(2, '0')}:00+05:30`);
          
          setIsSalesOpen(istNow.getTime() >= openTarget.getTime());
        }
      })
      .catch((err) => console.warn('Could not fetch dynamic settings:', err));

    // 3. Fetch active and all ticket phases
    fetch('/api/tickets/phases')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.phases) setAllPhases(data.phases);
          if (data.currentActive) setCurrentPhase(data.currentActive);
        }
      })
      .catch((err) => console.warn('Could not fetch ticket phases:', err));
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
                height: 'auto',
                padding: '6px 18px',
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
              p="lg"
              radius="lg"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.85)',
                border: isSalesOpen ? '1px solid rgba(250, 204, 21, 0.6)' : '1px solid rgba(234, 179, 8, 0.35)',
                boxShadow: isSalesOpen ? '0 0 30px rgba(234, 179, 8, 0.3)' : 'none',
                backdropFilter: 'blur(12px)',
                marginTop: 15,
                maxWidth: 540,
                width: '100%',
              }}
            >
              {isSalesOpen ? (
                <Stack gap="xs" align="center">
                  <Badge
                    color="green"
                    variant="filled"
                    size="md"
                    style={{ letterSpacing: '0.08em', fontWeight: 800 }}
                  >
                    ● PASSES NOW AVAILABLE
                  </Badge>

                  <Text fw={800} size="lg" className="gold-gradient-text" ta="center" style={{ fontFamily: "'Cinzel', serif" }}>
                    {currentPhase?.name || 'Grand Dandiya Entry Passes'}
                  </Text>

                  <Text size="sm" c="gray.3" ta="center">
                    ₹{currentPhase?.adultPrice || 499} / Adult • ₹{currentPhase?.childPrice || 199} / Child (Under 55&quot;)
                  </Text>

                  <Group gap={6} justify="center" wrap="wrap">
                    <Badge
                      color="yellow"
                      variant="light"
                      size="sm"
                      leftSection={<IconGift size={13} color="#facc15" />}
                    >
                      Includes ₹{currentPhase?.voucherAmount || 100} Free Stall Voucher
                    </Badge>
                    <Badge
                      color="yellow"
                      variant="light"
                      size="sm"
                      leftSection={<IconSparkles size={13} color="#facc15" />}
                    >
                      Free Dandiya Sticks for All Attendees
                    </Badge>
                  </Group>

                  <Group justify="center" gap="sm" mt="xs" w="100%">
                    <Button
                      component={Link}
                      href="/dandiyaraas/tickets/buy"
                      className="btn-auspicious-gold"
                      size="lg"
                      leftSection={<IconTicket size={22} />}
                      rightSection={<IconArrowRight size={18} />}
                      fullWidth
                    >
                      Book Entry Passes Now
                    </Button>
                  </Group>
                </Stack>
              ) : (
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
                      Ticket Booking Opens {settings.ticket_booking_start_date ? new Date(settings.ticket_booking_start_date + 'T00:00:00+05:30').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '1 Sept'}
                    </Button>
                  </Group>
                </Stack>
              )}
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* FESTIVAL PASS PHASES & PRICING SECTION */}
      <Box
        id="pricing"
        py={80}
        style={{
          background: 'linear-gradient(180deg, rgba(20, 3, 5, 0.95) 0%, rgba(38, 8, 14, 0.9) 50%, rgba(13, 2, 4, 0.95) 100%)',
          borderTop: '1px solid rgba(234, 179, 8, 0.2)',
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xs" mb={50}>
            <Badge
              size="md"
              style={{
                backgroundColor: '#facc15',
                color: '#140305',
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              OFFICIAL ENTRY PASSES
            </Badge>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}
            >
              Ticket Phases &amp; Pricing
            </Title>
            <Text c="gray.3" size="md" ta="center" maw={650}>
              Book early to secure the best rates! Every entry pass includes an exclusive <b>₹100 Free Stall Voucher</b> to spend at our vibrant food street and shopping stalls.
            </Text>
          </Stack>

          {/* Phases Grid */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {(allPhases.length > 0 ? allPhases : [
              {
                phaseNumber: 1,
                name: 'Phase 1 - Early Bird',
                startDate: '2026-09-01',
                endDate: '2026-09-10',
                adultPrice: 499,
                childPrice: 199,
                voucherAmount: 100,
              },
              {
                phaseNumber: 2,
                name: 'Phase 2 - Regular Entry',
                startDate: '2026-09-11',
                endDate: '2026-09-20',
                adultPrice: 599,
                childPrice: 199,
                voucherAmount: 100,
              },
              {
                phaseNumber: 3,
                name: 'Phase 3 - Last Chance',
                startDate: '2026-09-21',
                endDate: '2026-10-13',
                adultPrice: 699,
                childPrice: 199,
                voucherAmount: 100,
              },
            ]).map((p: any) => {
              const istToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
              const isPhaseActive = isSalesOpen && (currentPhase?.id ? p.id === currentPhase?.id : (istToday >= p.startDate && istToday <= p.endDate));
              const isPhasePassed = istToday > p.endDate;

              const formatPhaseDate = (dateStr: string) => {
                if (!dateStr) return '';
                const d = new Date(dateStr + 'T00:00:00+05:30');
                return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              };

              return (
                <Paper
                  key={p.phaseNumber || p.id}
                  p="xl"
                  radius="xl"
                  style={{
                    backgroundColor: isPhaseActive ? 'rgba(38, 8, 14, 0.95)' : 'rgba(20, 3, 5, 0.85)',
                    border: isPhaseActive ? '2px solid #facc15' : '1px solid rgba(234, 179, 8, 0.25)',
                    boxShadow: isPhaseActive ? '0 0 35px rgba(234, 179, 8, 0.35)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transform: isPhaseActive ? 'scale(1.03)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                  className="festive-card"
                >
                  <Stack gap="md">
                    {/* Badge and Dates */}
                    <Group justify="space-between" align="center">
                      <Badge
                        size="sm"
                        style={{
                          backgroundColor: '#facc15',
                          color: '#140305',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                        }}
                      >
                        PHASE {p.phaseNumber}
                      </Badge>

                      {isPhaseActive ? (
                        <Badge color="green" variant="filled" size="sm" style={{ fontWeight: 800 }}>
                          ● ACTIVE NOW
                        </Badge>
                      ) : isPhasePassed ? (
                        <Badge color="gray" variant="light" size="sm">
                          ENDED
                        </Badge>
                      ) : (
                        <Badge color="yellow" variant="light" size="sm" style={{ fontWeight: 700 }}>
                          OPENS {formatPhaseDate(p.startDate)}
                        </Badge>
                      )}
                    </Group>

                    {/* Phase Name & Schedule */}
                    <Box>
                      <Title order={3} size="h3" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                        {p.name}
                      </Title>
                      <Group gap={6} mt={6} align="center" wrap="nowrap">
                        <IconCalendar size={14} color="#facc15" style={{ flexShrink: 0 }} />
                        <Text size="xs" c="royalGold.4" fw={600} lh={1}>
                          {formatPhaseDate(p.startDate)} to {formatPhaseDate(p.endDate)}
                        </Text>
                      </Group>
                    </Box>

                    <Divider color="rgba(234, 179, 8, 0.2)" />

                    {/* Pricing Breakdown */}
                    <Stack gap={8}>
                      <Group justify="space-between" align="baseline">
                        <Text size="sm" c="gray.3">
                          Adult Pass (1 Attendee):
                        </Text>
                        <Text size="xl" fw={900} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
                          ₹{p.adultPrice}
                        </Text>
                      </Group>

                      <Group justify="space-between" align="baseline">
                        <Box>
                          <Text size="sm" c="gray.3">
                            Child Pass:
                          </Text>
                          <Text size="10px" c="gray.5">
                            Under 55&quot; Height (Verified at Entry)
                          </Text>
                        </Box>
                        <Text size="md" fw={700} c="white">
                          ₹{p.childPrice}
                        </Text>
                      </Group>
                    </Stack>

                    {/* Included Pass Perks */}
                    <Paper
                      p="xs"
                      radius="md"
                      style={{
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        border: '1px dashed rgba(250, 204, 21, 0.4)',
                      }}
                    >
                      <Stack gap={6}>
                        <Group gap="xs" align="center" wrap="nowrap">
                          <ThemeIcon size={24} radius="md" color="yellow" variant="filled" style={{ flexShrink: 0 }}>
                            <IconBuildingStore size={14} color="#140305" />
                          </ThemeIcon>
                          <Text size="xs" fw={600} c="yellow.2" style={{ flex: 1 }}>
                            Includes <b>₹{p.voucherAmount || 100} Free Stall Voucher</b> (Valid at{' '}
                            <span style={{ color: '#ffffff' }}>
                              {p.voucherApplicableTo === 'food'
                                ? 'Food Stalls'
                                : p.voucherApplicableTo === 'other'
                                ? 'Commercial Stalls'
                                : 'All 35 Stalls'}
                            </span>
                            )
                          </Text>
                        </Group>

                        <Group gap="xs" align="center" wrap="nowrap">
                          <ThemeIcon size={24} radius="md" color="yellow" variant="light" style={{ flexShrink: 0 }}>
                            <IconSparkles size={14} color="#facc15" />
                          </ThemeIcon>
                          <Text size="xs" fw={600} c="yellow.1" style={{ flex: 1 }}>
                            <b>Free Dandiya Sticks</b> for each adult &amp; accompanying children
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  </Stack>

                  {/* Booking CTA Button */}
                  <Box mt="lg">
                    {isPhaseActive ? (
                      <Button
                        component={Link}
                        href="/dandiyaraas/tickets/buy"
                        className="btn-auspicious-gold"
                        size="md"
                        fullWidth
                        leftSection={<IconTicket size={18} />}
                        rightSection={<IconArrowRight size={16} />}
                      >
                        Book Passes Now
                      </Button>
                    ) : isPhasePassed ? (
                      <Button size="md" fullWidth disabled variant="default">
                        Phase Ended
                      </Button>
                    ) : (
                      <Button size="md" fullWidth disabled variant="default">
                        Opens {formatPhaseDate(p.startDate)}
                      </Button>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </SimpleGrid>

          {/* Child Height Advisory */}
          <Paper
            p="md"
            radius="lg"
            mt="xl"
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              textAlign: 'center',
            }}
          >
            <Group justify="center" gap="xs">
              <IconSparkles size={18} color="#facc15" />
              <Text size="xs" c="gray.3">
                <b>Child Policy:</b> Children strictly under <b>55 inches (4&apos;7&quot;)</b> in height qualify for child passes. Physical height measurement will be verified at the gate.
              </Text>
            </Group>
          </Paper>
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

      {/* LUCKY DRAWS, PRIZES & PERKS SECTION */}
      <Box
        py={80}
        style={{
          background: 'linear-gradient(180deg, rgba(20, 3, 5, 0.95) 0%, rgba(38, 8, 14, 0.85) 50%, rgba(20, 3, 5, 0.95) 100%)',
          borderTop: '1px solid rgba(234, 179, 8, 0.2)',
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xs" mb={50}>
            <Badge
              size="md"
              style={{
                backgroundColor: '#facc15',
                color: '#140305',
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              CELEBRATION HIGHLIGHTS
            </Badge>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}
            >
              Lucky Draws &amp; Special Prizes
            </Title>
            <Text c="gray.3" size="md" ta="center" maw={650}>
              Exciting rewards, lucky draws, and complimentary dandiya sticks for attendees at Asha Bani Dandiya Raas 6.0!
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {/* 1. 10 Lucky Draws */}
            <Card
              className="festive-card"
              p="xl"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Group justify="space-between" align="flex-start" mb="md">
                  <ThemeIcon
                    size={52}
                    radius="md"
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                    }}
                  >
                    <IconGift size={28} color="#facc15" />
                  </ThemeIcon>
                  <Badge variant="light" color="yellow" size="sm" style={{ fontWeight: 700 }}>
                    10 LUCKY DRAWS
                  </Badge>
                </Group>

                <Title order={3} size="h4" c="white" mb="xs" style={{ fontFamily: "'Cinzel', serif" }}>
                  10 Lucky Draws
                </Title>
                <Text size="sm" c="gray.3" style={{ lineHeight: 1.6 }}>
                  10 lucky draws will be conducted that will offer a variety of rewards for attendees during the event.
                </Text>
              </Box>

              <Paper
                p="sm"
                radius="md"
                mt="lg"
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.2)',
                }}
              >
                <Text size="xs" c="yellow.2" fw={600}>
                  ✨ Conducted during the grand Dandiya celebration!
                </Text>
              </Paper>
            </Card>

            {/* 2. Special Prize Categories */}
            <Card
              className="festive-card"
              p="xl"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Group justify="space-between" align="flex-start" mb="md">
                  <ThemeIcon
                    size={52}
                    radius="md"
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                    }}
                  >
                    <IconTrophy size={28} color="#facc15" />
                  </ThemeIcon>
                  <Badge variant="light" color="yellow" size="sm" style={{ fontWeight: 700 }}>
                    PRIZE CATEGORIES
                  </Badge>
                </Group>

                <Title order={3} size="h4" c="white" mb="xs" style={{ fontFamily: "'Cinzel', serif" }}>
                  Category Prizes
                </Title>
                <Text size="sm" c="gray.3" mb="sm">
                  Prizes will be distributed to the following categories:
                </Text>

                <Stack gap="xs">
                  <Paper
                    p="xs"
                    radius="md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon size={26} radius="xl" color="yellow" variant="light" style={{ flexShrink: 0 }}>
                        <IconTicket size={14} color="#facc15" />
                      </ThemeIcon>
                      <Text size="xs" c="gray.2" fw={600}>
                        <span style={{ color: '#facc15' }}>First Booking:</span> Prize for the first booking
                      </Text>
                    </Group>
                  </Paper>

                  <Paper
                    p="xs"
                    radius="md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon size={26} radius="xl" color="pink" variant="light" style={{ flexShrink: 0 }}>
                        <IconCrown size={14} color="#f472b6" />
                      </ThemeIcon>
                      <Text size="xs" c="gray.2" fw={600}>
                        <span style={{ color: '#facc15' }}>First Lady Arrival:</span> The very first lady who joins the program
                      </Text>
                    </Group>
                  </Paper>

                  <Paper
                    p="xs"
                    radius="md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon size={26} radius="xl" color="orange" variant="light" style={{ flexShrink: 0 }}>
                        <IconFlame size={14} color="#fb923c" />
                      </ThemeIcon>
                      <Text size="xs" c="gray.2" fw={600}>
                        <span style={{ color: '#facc15' }}>Energetic Dancer:</span> Prize for the energetic dancer
                      </Text>
                    </Group>
                  </Paper>

                  <Paper
                    p="xs"
                    radius="md"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon size={26} radius="xl" color="cyan" variant="light" style={{ flexShrink: 0 }}>
                        <IconSparkles size={14} color="#38bdf8" />
                      </ThemeIcon>
                      <Text size="xs" c="gray.2" fw={600}>
                        <span style={{ color: '#facc15' }}>Best Traditional Outfit:</span> Prize for best traditional outfit
                      </Text>
                    </Group>
                  </Paper>
                </Stack>
              </Box>
            </Card>

            {/* 3. Complimentary Dandiya Sticks */}
            <Card
              className="festive-card"
              p="xl"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Group justify="space-between" align="flex-start" mb="md">
                  <ThemeIcon
                    size={52}
                    radius="md"
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                    }}
                  >
                    <IconSparkles size={28} color="#facc15" />
                  </ThemeIcon>
                  <Badge variant="light" color="green" size="sm" style={{ fontWeight: 700 }}>
                    COMPLIMENTARY
                  </Badge>
                </Group>

                <Title order={3} size="h4" c="white" mb="xs" style={{ fontFamily: "'Cinzel', serif" }}>
                  Free Dandiya Sticks
                </Title>
                <Text size="sm" c="gray.3" style={{ lineHeight: 1.6 }}>
                  Free dandiya sticks will be given to each adult and accompanying children if any.
                </Text>
              </Box>

              <Paper
                p="sm"
                radius="md"
                mt="lg"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <Text size="xs" c="green.2" fw={600}>
                  ✓ Provided at the entry gate for every attendee!
                </Text>
              </Paper>
            </Card>
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
                <Badge color="royalGold" variant="filled" size="sm" mb="xs" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
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

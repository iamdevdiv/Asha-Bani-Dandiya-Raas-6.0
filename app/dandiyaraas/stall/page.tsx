'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  List,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconUsers,
  IconSparkles,
  IconBroadcast,
  IconCrown,
  IconSpeakerphone,
  IconIdBadge2,
  IconTicket,
  IconClock,
  IconShieldCheck,
  IconArrowRight,
  IconCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StallMediaCarousel } from '@/components/StallMediaCarousel';
import { LayoutLightbox } from '@/components/LayoutLightbox';
import { INITIAL_CAROUSEL_IMAGES } from '@/lib/stall-data';

export default function StallExhibitorPage() {
  const [carouselImages, setCarouselImages] = useState(INITIAL_CAROUSEL_IMAGES);

  useEffect(() => {
    fetch('/api/media')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.images && data.images.length > 0) {
          setCarouselImages(data.images.filter((img: any) => img.isActive));
        }
      })
      .catch((err) => console.warn('Could not fetch dynamic carousel:', err));
  }, []);

  const whatIsDifferent = [
    {
      title: 'Massive Festive Footfall',
      desc: 'Anticipating thousands of enthusiastic attendees, families, and shoppers across the festive evening.',
      icon: <IconUsers size={28} color="#facc15" />,
    },
    {
      title: 'Expanded Variety of Stalls',
      desc: 'Curated zoning featuring boutique ethnic couture, artisanal jewellery, footwear, and gourmet food brands.',
      icon: <IconBuildingStore size={28} color="#facc15" />,
    },
    {
      title: 'Amplified Media & Press Coverage',
      desc: 'Extensive on-ground news media presence, video coverage, and high-visibility digital broadcasts.',
      icon: <IconBroadcast size={28} color="#facc15" />,
    },
    {
      title: 'Premium City Demographic',
      desc: 'Direct access to elite, high-spending families and youth from Saharanpur and neighbouring cities.',
      icon: <IconCrown size={28} color="#facc15" />,
    },
    {
      title: 'Influencer Marketing & Stage PR',
      desc: 'Collaborations with top regional creators, social media buzz, and stage recognition for partner brands.',
      icon: <IconSpeakerphone size={28} color="#facc15" />,
    },
  ];

  const perks = [
    {
      title: 'Massive Footfall & Sales',
      desc: 'Direct exposure to high-intent festive buyers eager to shop ethnic wear, food, and lifestyle goods.',
      icon: <IconUsers size={24} color="#facc15" />,
    },
    {
      title: 'On-Ground Media Spotlight',
      desc: 'Your brand showcased across media coverage, promotional banners, and festival recaps.',
      icon: <IconBroadcast size={24} color="#facc15" />,
    },
    {
      title: '2 Free Official Passes',
      desc: 'Complimentary vendor passes issued directly under your registered brand name.',
      icon: <IconTicket size={24} color="#facc15" />,
    },
    {
      title: 'Official Exhibitor ID Badges',
      desc: 'Seamless backstage and venue entry with personalized official identification.',
      icon: <IconIdBadge2 size={24} color="#facc15" />,
    },
    {
      title: 'Anchor & Screen Promotions',
      desc: 'Live announcements by the event host and prominent digital screen shoutouts throughout the night.',
      icon: <IconSpeakerphone size={24} color="#facc15" />,
    },
    {
      title: 'Live Festival Celebration',
      desc: 'Experience the exhilarating music, dance, and cultural energy while growing your brand.',
      icon: <IconSparkles size={24} color="#facc15" />,
    },
  ];

  const regulations = [
    'Each stall allotment includes 2 display tables and 1 dedicated space block.',
    'Strict no-cancellation and no-refund policy applies upon confirmation.',
    '2 persons are permitted per vendor pass; additional crew passes are chargeable.',
    'Event operational timing: 6:00 PM to 12:00 AM.',
    'Stall setup access begins at 4:00 PM sharp for advance decoration.',
    'Organizers are not responsible for loss, theft, or damage to vendor merchandise.',
    'Exhibitors are requested to maintain utmost event decorum and safety guidelines at all times.',
  ];

  return (
    <Box className="festive-background">
      <Navbar />

      {/* HERO SECTION */}
      <Box
        py={70}
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(127, 29, 29, 0.45) 0%, rgba(13, 2, 4, 0.95) 100%)',
          borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
          textAlign: 'center',
        }}
      >
        <Container size="md">
          <Stack align="center" gap="md">
            <Badge
              size="lg"
              variant="outline"
              color="royalGold"
              radius="xl"
              style={{
                borderColor: '#facc15',
                color: '#fef08a',
                padding: '10px 18px',
                letterSpacing: '0.1em',
              }}
            >
              EXHIBITOR &amp; BRAND PARTNERSHIP PORTAL
            </Badge>

            <Title
              order={1}
              className="gold-gradient-text"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                lineHeight: 1.2,
                fontWeight: 900,
              }}
            >
              Hey Brands, Welcome to Asha Bani Dandiya Raas 6.0
            </Title>

            <Text size="lg" c="gray.3" maw={700} style={{ lineHeight: 1.6 }}>
              Showcase your products, food delicacies, or artisanal creations to thousands of festive shoppers. Select your preferred stall on our interactive layout and reserve instantly.
            </Text>

            <Group gap="md" mt="sm">
              <Button
                component={Link}
                href="/dandiyaraas/stall/book"
                size="lg"
                className="btn-auspicious-gold"
                leftSection={<IconBuildingStore size={22} />}
                rightSection={<IconArrowRight size={18} />}
              >
                Choose Your Stall on Map
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* PREVIOUS YEAR STALLS CAROUSEL */}
      <Box py={60}>
        <Container size="xl">
          <Stack align="center" gap="xs" mb="md">
            <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.12em' }}>
              EVENT GALLERY
            </Text>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Glimpses of Previous Year Stalls &amp; Energy
            </Title>
            <Text size="sm" c="gray.4" ta="center">
              Swipe or drag through moments of enthusiastic footfall, vibrant stalls, and festive celebrations.
            </Text>
          </Stack>

          <StallMediaCarousel images={carouselImages} />
        </Container>
      </Box>

      {/* WHAT'S DIFFERENT THIS YEAR SECTION */}
      <Box
        py={70}
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.7)',
          borderTop: '1px solid rgba(234, 179, 8, 0.15)',
          borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xs" mb={40}>
            <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.12em' }}>
              GROWTH &amp; SCALE
            </Text>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              What&apos;s Different This Year?
            </Title>
            <Text size="sm" c="gray.4" ta="center" maw={650}>
              We are raising the bar for the 6th edition with unmatched production value, wider regional outreach, and elevated brand opportunities.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {whatIsDifferent.map((item, index) => (
              <Card key={index} className="festive-card" p="xl">
                <ThemeIcon
                  size={50}
                  radius="md"
                  mb="md"
                  style={{
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                  }}
                >
                  {item.icon}
                </ThemeIcon>
                <Title order={3} size="h4" c="white" mb="xs" style={{ fontFamily: "'Cinzel', serif" }}>
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

      {/* PERKS & BENEFITS SECTION */}
      <Box py={80}>
        <Container size="xl">
          <Stack align="center" gap="xs" mb={50}>
            <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.12em' }}>
              EXHIBITOR ADVANTAGE
            </Text>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Exclusive Perks for Our Brand Partners
            </Title>
            <Text size="sm" c="gray.4" ta="center" maw={600}>
              Beyond stall space, partnering with Asha Bani Dandiya Raas provides holistic brand visibility and measurable returns.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {perks.map((p, idx) => (
              <Paper
                key={idx}
                p="xl"
                radius="lg"
                style={{
                  backgroundColor: 'rgba(36, 8, 14, 0.65)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                }}
                className="festive-card"
              >
                <Group gap="sm" mb="xs" wrap="nowrap" align="center">
                  <ThemeIcon size={40} radius="md" color="royalGold" variant="light" style={{ flexShrink: 0 }}>
                    {p.icon}
                  </ThemeIcon>
                  <Text fw={700} size="md" c="white" style={{ fontFamily: "'Cinzel', serif", flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                    {p.title}
                  </Text>
                </Group>
                <Text size="sm" c="gray.4" style={{ lineHeight: 1.6 }} mt="xs">
                  {p.desc}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* STALL LAYOUT BLUEPRINTS GALLERY */}
      <Box
        py={70}
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.7)',
          borderTop: '1px solid rgba(234, 179, 8, 0.15)',
          borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xs" mb="lg">
            <Text fw={700} c="royalGold.4" size="sm" style={{ letterSpacing: '0.12em' }}>
              DIMENSIONS &amp; ZONING
            </Text>
            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Stall Layout Blueprints &amp; Specifications
            </Title>
            <Text size="sm" c="gray.4" ta="center" maw={650}>
              Click any blueprint below to inspect full-screen diagrams, dimensions, and zoning details.
            </Text>
          </Stack>

          <LayoutLightbox />
        </Container>
      </Box>

      {/* STALL REGULATIONS & GUIDELINES */}
      <Box py={80}>
        <Container size="lg">
          <Paper
            p={{ base: 'lg', md: 'xl' }}
            radius="xl"
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.75)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            <Group gap="sm" mb="md" align="center" wrap="nowrap">
              <ThemeIcon size={36} radius="md" color="yellow" variant="light" style={{ flexShrink: 0 }}>
                <IconShieldCheck size={22} />
              </ThemeIcon>
              <Title order={3} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                Exhibitor Terms &amp; Stall Regulations
              </Title>
            </Group>

            <Text size="sm" c="gray.4" mb="lg">
              Please review the following essential policies prior to reserving your stall:
            </Text>

            <List
              spacing="sm"
              size="sm"
              icon={
                <ThemeIcon color="royalGold" size={20} radius="xl" variant="light">
                  <IconCheck size={12} stroke={3} />
                </ThemeIcon>
              }
            >
              {regulations.map((reg, index) => (
                <List.Item key={index}>
                  <Text size="sm" c="gray.2">
                    {reg}
                  </Text>
                </List.Item>
              ))}
            </List>

            <Box mt="xl" pt="md" style={{ borderTop: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <Box>
                  <Text fw={700} size="sm" c="royalGold.3">
                    Questions or Custom Requirements?
                  </Text>
                  <Text size="xs" c="gray.4">
                    Call our Stall Allotment Coordinator: +91 6399063455
                  </Text>
                </Box>

                <Button
                  component={Link}
                  href="/dandiyaraas/stall/book"
                  size="md"
                  className="btn-auspicious-gold"
                  leftSection={<IconBuildingStore size={20} />}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Proceed to Interactive Booking
                </Button>
              </Group>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

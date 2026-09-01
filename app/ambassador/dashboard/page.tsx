'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Divider,
  Progress,
  SimpleGrid,
  Card,
  ThemeIcon,
  Table,
  ActionIcon,
  Alert,
  Loader,
  Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCrown,
  IconTicket,
  IconBuildingStore,
  IconCopy,
  IconBrandWhatsapp,
  IconUsers,
  IconCheck,
  IconLogout,
  IconSparkles,
  IconLock,
  IconArrowRight,
  IconGift,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { openWhatsAppChat } from '@/lib/whatsapp';

export default function AmbassadorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const fetchDashboard = () => {
    fetch('/api/ambassadors/dashboard')
      .then((res) => {
        if (res.status === 401) {
          router.push('/ambassador/login');
          return null;
        }
        return res.json();
      })
      .then((resData) => {
        if (resData && resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error('Error loading dashboard:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/ambassadors/logout', { method: 'POST' });
    router.push('/ambassador/login');
  };

  const getReferralUrl = () => {
    if (typeof window !== 'undefined' && data?.ambassador) {
      const origin = window.location.origin;
      return `${origin}/dandiyaraas?ref=${data.ambassador.refCode}`;
    }
    return '';
  };

  const handleCopyLink = () => {
    const url = getReferralUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      notifications.show({
        title: 'Link Copied',
        message: 'Your unique referral link has been copied.',
        color: 'green',
      });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const getVoucherUsabilityText = (applicability?: string) => {
    if (applicability === 'food') return 'Food Stalls Only (Stalls 1-15)';
    if (applicability === 'other') return 'Commercial & Shopping Stalls (Stalls A-T)';
    return 'All 35 Stalls (Food + Commercial)';
  };

  const handleShareWhatsApp = () => {
    const url = getReferralUrl();
    if (url && data?.ambassador) {
      const voucherAmount = data?.activePhase?.voucherAmount || 100;
      const usability = getVoucherUsabilityText(data?.activePhase?.voucherApplicableTo);
      const msg =
        `*JOIN US AT ASHA BANI DANDIYA RAAS 6.0!*\n\n` +
        `Enjoy a grand festive night of energetic Garba, live orchestra, and delicious Gujarati food stalls on *13 October 2026* at Maharaja Agrasen Bhavan, Saharanpur!\n\n` +
        `*Book Official Passes Here:*\n${url}\n\n` +
        `*Special Included Perk:* Every pass includes a *Rs. ${voucherAmount} Free Stall Voucher*!`;

      openWhatsAppChat('', msg);
    }
  };

  if (loading) {
    return (
      <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Center>
          <Stack align="center" gap="sm">
            <Loader color="royalGold" size="lg" />
            <Text c="gray.4" size="sm" fw={600}>
              Loading ambassador dashboard...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (!data || !data.ambassador) {
    return null;
  }

  const amb = data.ambassador;
  const tiers = data.tiers || [];
  const referrals = data.referralsList || [];

  // Next milestone calculation
  const tier1 = tiers.find((t: any) => Number(t.tierLevel) === 1) || { referralsRequired: 10, voucherAmount: 0, voucherApplicableTo: 'food', grantsFreeTicket: true };
  const tier2 = tiers.find((t: any) => Number(t.tierLevel) === 2) || { referralsRequired: 25, voucherAmount: 1000, voucherApplicableTo: 'both', grantsFreeTicket: true };

  const currentRefs = amb.referralCount || 0;
  const nextTarget = currentRefs < tier1.referralsRequired ? tier1.referralsRequired : tier2.referralsRequired;
  const progressPercent = Math.min(100, Math.round((currentRefs / nextTarget) * 100));

  return (
    <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container size="lg" py={50} style={{ flexGrow: 1 }}>
        <Stack gap="xl">
          {/* Header Bar */}
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Box>
              <Group gap="xs">
                <Badge color="royalGold" variant="filled" size="md" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
                  AMBASSADOR CONSOLE
                </Badge>
                <Badge
                  variant="outline"
                  color="royalGold"
                  size="md"
                  style={{
                    fontFamily: 'monospace',
                    color: '#fef08a',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(234, 179, 8, 0.4)',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                  }}
                >
                  {amb.refCode}
                </Badge>
              </Group>
              <Title order={1} className="gold-gradient-text" mt={4} style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)' }}>
                Welcome, {amb.name}
              </Title>
            </Box>

            <Button
              variant="light"
              color="red"
              size="xs"
              onClick={handleLogout}
              leftSection={<IconLogout size={16} />}
            >
              Sign Out
            </Button>
          </Group>

          {/* ========================================================================= */}
          {/* 1. UNIQUE REFERRAL LINK CARD                                              */}
          {/* ========================================================================= */}
          <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, rgba(42, 8, 12, 0.95) 0%, rgba(20, 3, 5, 0.95) 100%)',
              border: '2px solid rgba(250, 204, 21, 0.5)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Box>
                  <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.1em' }}>
                    YOUR UNIQUE TRACKING LINK
                  </Text>
                  <Text size="sm" c="gray.3" mt={2}>
                    Share this link with your friends, college peers, and community. Bookings made via this link are tracked automatically.
                  </Text>
                </Box>
                <Badge color="green" variant="light" size="sm">
                  AUTO-TRACKED
                </Badge>
              </Group>

              <Paper
                p="sm"
                radius="md"
                style={{
                  backgroundColor: '#0a0102',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  overflowX: 'auto',
                }}
              >
                <Text size="sm" fw={600} c="yellow.2" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {getReferralUrl()}
                </Text>

                <Group gap="xs" style={{ flexShrink: 0 }}>
                  <Button
                    size="xs"
                    variant="light"
                    color="royalGold"
                    onClick={handleCopyLink}
                    leftSection={copied ? <IconCheck size={14} color="#4ade80" /> : <IconCopy size={14} />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>

                  <Button
                    size="xs"
                    color="green"
                    variant="filled"
                    onClick={handleShareWhatsApp}
                    leftSection={<IconBrandWhatsapp size={14} />}
                  >
                    Share
                  </Button>
                </Group>
              </Paper>

              <Group gap="xs" align="center">
                <IconBuildingStore size={16} color="#facc15" />
                <Text size="xs" c="gray.3">
                  Each referred pass includes a <b>₹{data?.activePhase?.voucherAmount || 100} Free Stall Voucher</b> (Valid at: <span style={{ color: '#facc15', fontWeight: 600 }}>{getVoucherUsabilityText(data?.activePhase?.voucherApplicableTo)}</span>).
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* ========================================================================= */}
          {/* 2. REWARD MILESTONE PROGRESS                                              */}
          {/* ========================================================================= */}
          <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="xl"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
                <Box>
                  <Text size="xs" fw={700} c="royalGold.4">
                    REFERRAL PROGRESS
                  </Text>
                  <Title order={2} size="h3" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    {currentRefs} Bookings Referred
                  </Title>
                </Box>
                <Text size="sm" c="gray.4">
                  Next Milestone Target: <b>{nextTarget} referrals</b> ({Math.max(0, nextTarget - currentRefs)} remaining)
                </Text>
              </Group>

              <Progress
                value={progressPercent}
                size="xl"
                radius="xl"
                color="yellow"
                striped
                animated
                styles={{ root: { backgroundColor: '#2a080c' } }}
              />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="sm">
                {/* Tier 1 Card */}
                <Card
                  p="md"
                  radius="lg"
                  style={{
                    backgroundColor: currentRefs >= tier1.referralsRequired ? 'rgba(34, 197, 94, 0.15)' : 'rgba(36, 8, 14, 0.6)',
                    border: currentRefs >= tier1.referralsRequired ? '1px solid #22c55e' : '1px solid rgba(234, 179, 8, 0.25)',
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <ThemeIcon size={36} radius="md" color={currentRefs >= tier1.referralsRequired ? 'green' : 'yellow'} variant="light">
                      <IconCrown size={20} />
                    </ThemeIcon>
                    <Badge color={currentRefs >= tier1.referralsRequired ? 'green' : 'gray'} variant="filled" size="xs">
                      {currentRefs >= tier1.referralsRequired ? '✓ UNLOCKED' : `${currentRefs}/${tier1.referralsRequired} REFERRALS`}
                    </Badge>
                  </Group>
                  <Text fw={700} size="sm" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Tier 1: {tier1.referralsRequired} Referrals
                  </Text>
                  <Group gap={6} mt={4} align="center" wrap="nowrap">
                    <IconGift size={14} color="#facc15" style={{ flexShrink: 0 }} />
                    <Text size="xs" c="gray.3" lh={1}>
                      {tier1.voucherAmount > 0 ? (
                        <>
                          <b>₹{tier1.voucherAmount} Stall Voucher</b> ({tier1.voucherApplicableTo === 'food' ? 'Food Stalls' : tier1.voucherApplicableTo === 'other' ? 'Commercial Stalls' : 'All Stalls'})
                          {tier1.grantsFreeTicket ? <> + <b>1 Free Entry Pass</b></> : null}
                        </>
                      ) : (
                        <>{tier1.grantsFreeTicket ? <b>1 Free Official Adult Entry Pass</b> : <b>Tier 1 Unlocked</b>}</>
                      )}
                    </Text>
                  </Group>
                </Card>

                {/* Tier 2 Card */}
                <Card
                  p="md"
                  radius="lg"
                  style={{
                    backgroundColor: currentRefs >= tier2.referralsRequired ? 'rgba(34, 197, 94, 0.15)' : 'rgba(36, 8, 14, 0.6)',
                    border: currentRefs >= tier2.referralsRequired ? '1px solid #22c55e' : '1px solid rgba(234, 179, 8, 0.25)',
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <ThemeIcon size={36} radius="md" color={currentRefs >= tier2.referralsRequired ? 'green' : 'yellow'} variant="light">
                      <IconSparkles size={20} />
                    </ThemeIcon>
                    <Badge color={currentRefs >= tier2.referralsRequired ? 'green' : 'gray'} variant="filled" size="xs">
                      {currentRefs >= tier2.referralsRequired ? '✓ UNLOCKED' : `${currentRefs}/${tier2.referralsRequired} REFERRALS`}
                    </Badge>
                  </Group>
                  <Text fw={700} size="sm" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Tier 2: {tier2.referralsRequired} Referrals
                  </Text>
                  <Group gap={6} mt={4} align="center" wrap="nowrap">
                    <IconGift size={14} color="#facc15" style={{ flexShrink: 0 }} />
                    <Text size="xs" c="gray.3" lh={1}>
                      {tier2.voucherAmount > 0 ? (
                        <>
                          <b>₹{tier2.voucherAmount} Total Voucher</b> ({tier2.voucherApplicableTo === 'food' ? 'Food Stalls' : tier2.voucherApplicableTo === 'other' ? 'Commercial Stalls' : 'All Stalls'})
                          {tier2.grantsFreeTicket ? <> + <b>Free Entry Pass</b></> : null}
                        </>
                      ) : (
                        <>{tier2.grantsFreeTicket ? <b>Free Official Entry Pass</b> : <b>Tier 2 Unlocked</b>}</>
                      )}
                    </Text>
                  </Group>
                </Card>
              </SimpleGrid>
            </Stack>
          </Paper>

          {/* ========================================================================= */}
          {/* 3. UNLOCKED REWARDS ACCESS (FREE PASS & VOUCHER WALLET)                    */}
          {/* ========================================================================= */}
          {amb.earnedFreeTicket && (
            <Paper
              p="lg"
              radius="xl"
              style={{
                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(20, 3, 5, 0.9) 100%)',
                border: '1px solid #22c55e',
              }}
            >
              <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <Group gap="md">
                  <ThemeIcon size={48} radius="xl" color="green" variant="filled">
                    <IconTicket size={26} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={800} size="md" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                      Congratulations! Your Free Entry Pass is Ready
                    </Text>
                    <Text size="xs" c="gray.3">
                      You cleared Tier 1 Milestone ({tier1.referralsRequired} referrals required) with {currentRefs} verified ticket referrals.
                    </Text>
                  </Box>
                </Group>

                <Group gap="sm">
                  {amb.freeTicketBookingId ? (
                    <Button
                      component={Link}
                      href={`/dandiyaraas/tickets/pass/${amb.freeTicketBookingId}`}
                      size="sm"
                      className="btn-auspicious-gold"
                      leftSection={<IconTicket size={18} />}
                    >
                      {amb.voucherBalance > 0
                        ? `View Pass & Food Voucher (₹${amb.voucherBalance})`
                        : 'View / Download Official Pass'}
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      href={`/dandiyaraas/tickets/voucher/${amb.id}`}
                      size="sm"
                      className="btn-auspicious-gold"
                      leftSection={<IconBuildingStore size={18} />}
                    >
                      Use Voucher Wallet (₹{amb.voucherBalance})
                    </Button>
                  )}
                </Group>
              </Group>
            </Paper>
          )}

          {/* ========================================================================= */}
          {/* 4. REFERRED ATTENDEES LIST                                                */}
          {/* ========================================================================= */}
          <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="xl"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <IconUsers size={22} color="#facc15" />
                  <Title order={2} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Referred Bookings ({referrals.length})
                  </Title>
                </Group>
                <Badge color="royalGold" variant="light" size="sm">
                  PII PROTECTED
                </Badge>
              </Group>

              <Divider color="rgba(234, 179, 8, 0.2)" />

              {referrals.length === 0 ? (
                <Text size="sm" c="gray.4" ta="center" py="xl">
                  No ticket bookings have been completed via your link yet. Share your link above to begin earning!
                </Text>
              ) : (
                <Box style={{ overflowX: 'auto' }}>
                  <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: '#facc15' }}>#</Table.Th>
                        <Table.Th style={{ color: '#facc15' }}>Attendee Name</Table.Th>
                        <Table.Th style={{ color: '#facc15' }}>Booking ID</Table.Th>
                        <Table.Th style={{ color: '#facc15' }}>Booking Date</Table.Th>
                        <Table.Th style={{ color: '#facc15' }}>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {referrals.map((item: any, idx: number) => (
                        <Table.Tr key={idx}>
                          <Table.Td>{idx + 1}</Table.Td>
                          <Table.Td style={{ fontWeight: 600, color: '#ffffff' }}>{item.name}</Table.Td>
                          <Table.Td style={{ fontFamily: 'monospace', color: '#fde047' }}>{item.bookingNumber}</Table.Td>
                          <Table.Td style={{ color: '#d1d5db' }}>{item.date}</Table.Td>
                          <Table.Td>
                            <Badge color="green" size="xs" variant="filled">
                              CONFIRMED
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}

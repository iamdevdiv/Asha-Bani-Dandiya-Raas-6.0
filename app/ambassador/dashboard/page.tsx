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
import { renderMessageTemplate, getVoucherUsabilityLabel, DEFAULT_TEMPLATES } from '@/lib/message-templates-core';

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

  const handleShareWhatsApp = () => {
    const url = getReferralUrl();
    if (url && data?.ambassador) {
      const activePhase = data?.activePhase;
      const voucherAmount = activePhase?.voucherAmount ?? 100;
      const usability = getVoucherUsabilityLabel(activePhase?.voucherApplicableTo);
      const template =
        data?.shareMessageTemplate || DEFAULT_TEMPLATES.template_ambassador_share_wa.defaultText;

      const msg = renderMessageTemplate(template, {
        referral_url: url,
        voucher_amount: voucherAmount,
        voucher_usability: usability,
        phase_name: activePhase?.name || 'Current Phase',
        adult_price: activePhase?.adultPrice || 499,
        event_date: '13 October 2026',
        venue: 'Maharaja Agrasen Bhavan, Saharanpur',
        ambassador_name: data.ambassador.name || 'Campus Ambassador',
      });

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

      <Container size="xl" px={{ base: 'md', sm: 'xl' }} py={{ base: 24, sm: 40 }} style={{ flexGrow: 1, width: '100%' }}>
        <Stack gap="lg">
          {/* Header Bar */}
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Box style={{ maxWidth: '100%' }}>
              <Group gap="xs" wrap="wrap">
                <Badge color="royalGold" variant="filled" size="sm" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
                  AMBASSADOR CONSOLE
                </Badge>
                <Badge
                  variant="outline"
                  color="royalGold"
                  size="sm"
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
              <Title order={1} className="gold-gradient-text" mt={4} style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.4rem, 4.5vw, 2.4rem)', wordBreak: 'break-word' }}>
                Welcome, {amb.name}
              </Title>
            </Box>

            <Button
              variant="light"
              color="red"
              size="xs"
              onClick={handleLogout}
              leftSection={<IconLogout size={15} />}
            >
              Sign Out
            </Button>
          </Group>

          {/* ========================================================================= */}
          {/* 1. UNIQUE REFERRAL LINK CARD                                              */}
          {/* ========================================================================= */}
          <Paper
            p={{ base: 'sm', sm: 'xl' }}
            radius="lg"
            style={{
              background: 'linear-gradient(135deg, rgba(42, 8, 12, 0.95) 0%, rgba(20, 3, 5, 0.95) 100%)',
              border: '2px solid rgba(250, 204, 21, 0.5)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              maxWidth: '100%',
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Box style={{ flex: 1, minWidth: 200 }}>
                  <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.08em' }}>
                    YOUR UNIQUE TRACKING LINK
                  </Text>
                  <Text size="xs" c="gray.3" mt={2}>
                    Share this link with your friends, college peers, and community. Bookings made via this link are tracked automatically.
                  </Text>
                </Box>
                <Badge color="green" variant="light" size="xs">
                  AUTO-TRACKED
                </Badge>
              </Group>

              {/* URL Display Box */}
              <Paper
                p="xs"
                radius="md"
                style={{
                  backgroundColor: '#0a0102',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                <Text
                  size="xs"
                  fw={600}
                  c="yellow.2"
                  style={{
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    lineHeight: 1.4,
                  }}
                >
                  {getReferralUrl()}
                </Text>
              </Paper>

              {/* Responsive Buttons Grid */}
              <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="xs" style={{ width: '100%' }}>
                <Button
                  size="sm"
                  variant="light"
                  color="royalGold"
                  fullWidth
                  onClick={handleCopyLink}
                  leftSection={copied ? <IconCheck size={16} color="#4ade80" /> : <IconCopy size={16} />}
                  style={{ fontSize: '13px' }}
                >
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>

                <Button
                  size="sm"
                  color="green"
                  variant="filled"
                  fullWidth
                  onClick={handleShareWhatsApp}
                  leftSection={<IconBrandWhatsapp size={16} />}
                  style={{ fontSize: '13px' }}
                >
                  Share
                </Button>
              </SimpleGrid>

              <Group gap="xs" align="flex-start" wrap="nowrap" mt={4}>
                <IconBuildingStore size={16} color="#facc15" className="icon-align-text" />
                <Text size="xs" c="gray.3" lh={1.4}>
                  Each referred pass includes a <b>₹{data?.activePhase?.voucherAmount || 100} Free Stall Voucher</b> (Valid at: <span style={{ color: '#facc15', fontWeight: 600 }}>{getVoucherUsabilityLabel(data?.activePhase?.voucherApplicableTo)}</span>).
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* ========================================================================= */}
          {/* 2. REWARD MILESTONE PROGRESS                                              */}
          {/* ========================================================================= */}
          <Paper
            p={{ base: 'sm', sm: 'xl' }}
            radius="lg"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              maxWidth: '100%',
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="flex-end" wrap="wrap" gap="xs">
                <Box>
                  <Text size="xs" fw={700} c="royalGold.4">
                    REFERRAL PROGRESS
                  </Text>
                  <Title order={2} size="h3" c="white" style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>
                    {currentRefs} Bookings Referred
                  </Title>
                </Box>
                <Text size="xs" c="gray.4">
                  Target: <b>{nextTarget}</b> ({Math.max(0, nextTarget - currentRefs)} remaining)
                </Text>
              </Group>

              <Progress
                value={progressPercent}
                size="lg"
                radius="xl"
                color="yellow"
                striped
                animated
                styles={{ root: { backgroundColor: '#2a080c' } }}
              />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="xs">
                {/* Tier 1 Card */}
                <Card
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: currentRefs >= tier1.referralsRequired ? 'rgba(34, 197, 94, 0.15)' : 'rgba(36, 8, 14, 0.6)',
                    border: currentRefs >= tier1.referralsRequired ? '1px solid #22c55e' : '1px solid rgba(234, 179, 8, 0.25)',
                    maxWidth: '100%',
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <ThemeIcon size={32} radius="md" color={currentRefs >= tier1.referralsRequired ? 'green' : 'yellow'} variant="light">
                      <IconCrown size={18} />
                    </ThemeIcon>
                    <Badge color={currentRefs >= tier1.referralsRequired ? 'green' : 'gray'} variant="filled" size="xs">
                      {currentRefs >= tier1.referralsRequired ? '✓ UNLOCKED' : `${currentRefs}/${tier1.referralsRequired} REFS`}
                    </Badge>
                  </Group>
                  <Text fw={700} size="sm" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Tier 1: {tier1.referralsRequired} Referrals
                  </Text>
                  <Group gap={6} mt={4} align="flex-start" wrap="nowrap">
                    <IconGift size={15} color="#facc15" className="icon-align-text" />
                    <Text size="xs" c="gray.3" lh={1.35} style={{ flex: 1, wordBreak: 'break-word' }}>
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
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: currentRefs >= tier2.referralsRequired ? 'rgba(34, 197, 94, 0.15)' : 'rgba(36, 8, 14, 0.6)',
                    border: currentRefs >= tier2.referralsRequired ? '1px solid #22c55e' : '1px solid rgba(234, 179, 8, 0.25)',
                    maxWidth: '100%',
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <ThemeIcon size={32} radius="md" color={currentRefs >= tier2.referralsRequired ? 'green' : 'yellow'} variant="light">
                      <IconSparkles size={18} />
                    </ThemeIcon>
                    <Badge color={currentRefs >= tier2.referralsRequired ? 'green' : 'gray'} variant="filled" size="xs">
                      {currentRefs >= tier2.referralsRequired ? '✓ UNLOCKED' : `${currentRefs}/${tier2.referralsRequired} REFS`}
                    </Badge>
                  </Group>
                  <Text fw={700} size="sm" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Tier 2: {tier2.referralsRequired} Referrals
                  </Text>
                  <Group gap={6} mt={4} align="flex-start" wrap="nowrap">
                    <IconGift size={15} color="#facc15" className="icon-align-text" />
                    <Text size="xs" c="gray.3" lh={1.35} style={{ flex: 1, wordBreak: 'break-word' }}>
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
              p={{ base: 'sm', sm: 'lg' }}
              radius="lg"
              style={{
                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(20, 3, 5, 0.9) 100%)',
                border: '1px solid #22c55e',
                maxWidth: '100%',
              }}
            >
              <Stack gap="sm">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <ThemeIcon size={38} radius="xl" color="green" variant="filled" style={{ flexShrink: 0 }}>
                    <IconTicket size={22} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text fw={800} size="sm" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                      Congratulations! Your Free Entry Pass is Ready
                    </Text>
                    <Text size="xs" c="gray.3" mt={2}>
                      You cleared Tier 1 Milestone ({tier1.referralsRequired} referrals required) with {currentRefs} verified ticket referrals.
                    </Text>
                  </Box>
                </Group>

                <Group gap="xs" grow wrap="wrap">
                  {amb.freeTicketBookingId ? (
                    <Button
                      component={Link}
                      href={`/dandiyaraas/tickets/pass/${amb.freeTicketBookingId}`}
                      size="sm"
                      className="btn-auspicious-gold"
                      fullWidth
                      leftSection={<IconTicket size={16} />}
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
                      fullWidth
                      leftSection={<IconBuildingStore size={16} />}
                    >
                      Use Voucher Wallet (₹{amb.voucherBalance})
                    </Button>
                  )}
                </Group>
              </Stack>
            </Paper>
          )}

          {/* ========================================================================= */}
          {/* 4. REFERRED ATTENDEES LIST                                                */}
          {/* ========================================================================= */}
          <Paper
            p={{ base: 'sm', sm: 'xl' }}
            radius="lg"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Group gap="xs">
                  <IconUsers size={20} color="#facc15" />
                  <Title order={2} size="h5" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Referred Bookings ({referrals.length})
                  </Title>
                </Group>
                <Badge color="royalGold" variant="light" size="xs">
                  PII PROTECTED
                </Badge>
              </Group>

              <Divider color="rgba(234, 179, 8, 0.2)" />

              {referrals.length === 0 ? (
                <Text size="xs" c="gray.4" ta="center" py="lg">
                  No ticket bookings have been completed via your link yet. Share your link above to begin earning!
                </Text>
              ) : (
                <Table.ScrollContainer minWidth={460}>
                  <Table striped highlightOnHover verticalSpacing="xs">
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
                </Table.ScrollContainer>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}

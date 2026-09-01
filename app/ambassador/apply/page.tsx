'use client';

import React, { useState, useEffect } from 'react';
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
  TextInput,
  Textarea,
  Badge,
  SimpleGrid,
  ThemeIcon,
  Card,
  Alert,
  Skeleton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCrown,
  IconTicket,
  IconBuildingStore,
  IconUsers,
  IconUser,
  IconPhone,
  IconMail,
  IconSend,
  IconCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function AmbassadorApplyPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);

  useEffect(() => {
    fetch('/api/ambassadors/apply')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tiers) {
          setTiers(data.tiers);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTiers(false));
  }, []);

  const getUsabilityText = (applicability?: string) => {
    if (applicability === 'food') return 'food stalls only (Stalls 1–15)';
    if (applicability === 'other') return 'commercial & shopping stalls only (Stalls A–T)';
    return 'food and commercial stalls';
  };

  const tier1 = tiers.find((t) => Number(t.tierLevel) === 1) || { referralsRequired: 10, voucherAmount: 0, voucherApplicableTo: 'food' };
  const tier2 = tiers.find((t) => Number(t.tierLevel) === 2) || { referralsRequired: 25, voucherAmount: 1000, voucherApplicableTo: 'both' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notifications.show({ title: 'Name Required', message: 'Please enter your full name.', color: 'red' });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      notifications.show({ title: 'Invalid Mobile', message: 'Please enter a valid 10-digit mobile number starting with 6-9.', color: 'red' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      notifications.show({ title: 'Invalid Email', message: 'Please enter a valid email address.', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ambassadors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Application submission failed');
      }

      setSubmittedCode(data.refCode);
      notifications.show({
        title: 'Application Submitted',
        message: 'Thank you for applying! Our organizing team will review and contact you.',
        color: 'green',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Could not submit application.',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container size="md" py={60} style={{ flexGrow: 1 }}>
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center">
            <Badge color="royalGold" size="lg" variant="filled" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }} mb="xs">
              OFFICIAL AMBASSADOR INITIATIVE
            </Badge>
            <Title
              order={1}
              className="gold-gradient-text"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              Become an Ambassador
            </Title>
            <Text size="md" c="gray.3" mt={6} maw={600} mx="auto">
              Represent Asha Bani Dandiya Raas 6.0 in your college, network, and community. Earn exclusive free entry passes, cash stall vouchers, and VIP perks!
            </Text>
          </Box>

          {/* Ambassador Perks Overview */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card className="festive-card" p="lg">
              <ThemeIcon size={44} radius="md" color="yellow" variant="light" mb="sm">
                <IconCrown size={24} />
              </ThemeIcon>
              <Text fw={700} size="md" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                Tier 1 Milestone ({tier1.referralsRequired} Referrals)
              </Text>
              {loadingTiers ? (
                <Stack gap={6} mt={6}>
                  <Skeleton height={13} width="92%" radius="xl" />
                  <Skeleton height={13} width="65%" radius="xl" />
                </Stack>
              ) : (
                <Text size="xs" c="gray.4" mt={4}>
                  Earn a <b>Free Official Adult Entry Pass</b> for yourself
                  {tier1.voucherAmount > 0 ? (
                    <>
                      {' '}+ <b>₹{tier1.voucherAmount} Free Stall Voucher</b> to spend at {getUsabilityText(tier1.voucherApplicableTo)}
                    </>
                  ) : null}
                  {' '}upon reaching {tier1.referralsRequired} referrals!
                </Text>
              )}
            </Card>

            <Card className="festive-card" p="lg">
              <ThemeIcon size={44} radius="md" color="yellow" variant="light" mb="sm">
                <IconSparkles size={24} />
              </ThemeIcon>
              <Text fw={700} size="md" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                Tier 2 Milestone ({tier2.referralsRequired} Referrals)
              </Text>
              {loadingTiers ? (
                <Stack gap={6} mt={6}>
                  <Skeleton height={13} width="92%" radius="xl" />
                  <Skeleton height={13} width="65%" radius="xl" />
                </Stack>
              ) : (
                <Text size="xs" c="gray.4" mt={4}>
                  {tier2.voucherAmount > 0 ? (
                    <>
                      Upgrade your stall voucher balance to a whopping <b>₹{tier2.voucherAmount} Total Voucher</b> (valid at {getUsabilityText(tier2.voucherApplicableTo)}) &amp; Free Entry Pass upon reaching {tier2.referralsRequired} referrals!
                    </>
                  ) : (
                    <>
                      Earn a <b>Free Official Adult Entry Pass</b> upon reaching {tier2.referralsRequired} referrals!
                    </>
                  )}
                </Text>
              )}
            </Card>
          </SimpleGrid>

          {/* Form Card or Success Confirmation */}
          {submittedCode ? (
            <Paper
              p="xl"
              radius="xl"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.9)',
                border: '2px solid rgba(74, 222, 128, 0.5)',
                textAlign: 'center',
              }}
            >
              <ThemeIcon size={56} radius="50%" color="green" variant="filled" mx="auto" mb="md">
                <IconCheck size={32} />
              </ThemeIcon>
              <Title order={2} size="h3" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                Application Received!
              </Title>
              <Text size="sm" c="gray.3" mt="xs" maw={500} mx="auto">
                Your application has been registered with Reference Code:
              </Text>
              <Badge color="yellow" variant="filled" size="xl" mt="sm" className="badge-gold-filled" style={{ fontFamily: 'monospace', letterSpacing: '0.1em', color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
                {submittedCode}
              </Badge>
              <Text size="xs" c="gray.4" mt="md" maw={500} mx="auto">
                Our event coordination committee will verify your details and issue your ambassador login credentials shortly.
              </Text>
              <Group justify="center" gap="md" mt="xl">
                <Button component={Link} href="/ambassador/login" className="btn-auspicious-gold">
                  Go to Ambassador Login
                </Button>
                <Button component={Link} href="/dandiyaraas" variant="default">
                  Back to Event
                </Button>
              </Group>
            </Paper>
          ) : (
            <Paper
              p={{ base: 'md', sm: 'xl' }}
              radius="xl"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              }}
            >
              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                  <Title order={2} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Submit Your Ambassador Application
                  </Title>

                  <TextInput
                    label="Full Name"
                    placeholder="Enter your full name"
                    required
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    leftSection={<IconUser size={16} />}
                  />

                  <Group grow align="flex-start">
                    <TextInput
                      label="10-Digit Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.currentTarget.value.replace(/\D/g, '').slice(0, 10))}
                      leftSection={<IconPhone size={16} />}
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="Enter email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      leftSection={<IconMail size={16} />}
                    />
                  </Group>

                  <Textarea
                    label="College / Organization / Network Note"
                    placeholder="Tell us about your institution, student group, or community outreach plan..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.currentTarget.value)}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="btn-auspicious-gold"
                    loading={submitting}
                    leftSection={<IconSend size={20} />}
                  >
                    Submit Application
                  </Button>

                  <Group justify="center">
                    <Text size="xs" c="gray.4">
                      Already an approved ambassador?{' '}
                      <Link href="/ambassador/login" style={{ color: '#facc15', fontWeight: 600 }}>
                        Login here
                      </Link>
                    </Text>
                  </Group>
                </Stack>
              </form>
            </Paper>
          )}
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}

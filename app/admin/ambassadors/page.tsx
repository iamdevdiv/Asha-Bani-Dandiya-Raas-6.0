'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  Table,
  Badge,
  Tabs,
  Modal,
  TextInput,
  PasswordInput,
  NumberInput,
  Select,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  SimpleGrid,
  Card,
  ThemeIcon,
  Divider,
  Accordion,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCrown,
  IconUsers,
  IconCheck,
  IconX,
  IconKey,
  IconSparkles,
  IconTicket,
  IconCurrencyRupee,
  IconBuildingStore,
  IconSettings,
  IconEye,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCalendar,
  IconExternalLink,
} from '@tabler/icons-react';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminAmbassadorsPage() {
  const [loading, setLoading] = useState(true);
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);

  // Approve / Set Password Modal
  const [openedApprove, { open: openApprove, close: closeApprove }] = useDisclosure(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Reject Confirmation Modal
  const [ambassadorToReject, setAmbassadorToReject] = useState<any | null>(null);
  const [rejecting, setRejecting] = useState(false);

  // Edit Tiers Modal
  const [openedTiers, { open: openTiers, close: closeTiers }] = useDisclosure(false);
  const [tier1Refs, setTier1Refs] = useState<number | string>(10);
  const [tier1Voucher, setTier1Voucher] = useState<number | string>(500);
  const [tier1Applicability, setTier1Applicability] = useState<string | null>('both');
  const [tier2Refs, setTier2Refs] = useState<number | string>(25);
  const [tier2Voucher, setTier2Voucher] = useState<number | string>(1000);
  const [tier2Applicability, setTier2Applicability] = useState<string | null>('both');
  const [savingTiers, setSavingTiers] = useState(false);

  // Referred Bookings Modal State
  const [selectedAmbForBookings, setSelectedAmbForBookings] = useState<any | null>(null);
  const [referredBookings, setReferredBookings] = useState<any[]>([]);
  const [loadingReferredBookings, setLoadingReferredBookings] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/ambassadors').then((res) => res.json()),
      fetch('/api/admin/ambassadors/tiers').then((res) => res.json()),
    ])
      .then(([ambData, tierData]) => {
        if (ambData.success && ambData.ambassadors) {
          setAmbassadors(ambData.ambassadors);
        }
        if (tierData.success && tierData.tiers) {
          setTiers(tierData.tiers);
          const t1 = tierData.tiers.find((t: any) => t.tierLevel === 1);
          const t2 = tierData.tiers.find((t: any) => t.tierLevel === 2);
          if (t1) {
            setTier1Refs(t1.referralsRequired);
            setTier1Voucher(t1.voucherAmount);
            setTier1Applicability(t1.voucherApplicableTo || 'both');
          }
          if (t2) {
            setTier2Refs(t2.referralsRequired);
            setTier2Voucher(t2.voucherAmount);
            setTier2Applicability(t2.voucherApplicableTo || 'both');
          }
        }
      })
      .catch((err) => console.error('Error fetching ambassadors:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingApps = ambassadors.filter((a) => a.status === 'pending');
  const activeAmbassadors = ambassadors.filter((a) => a.status === 'approved');

  const handleOpenApprove = (amb: any) => {
    setSelectedAmbassador(amb);
    setNewPassword('ambassador2026'); // Default suggested password
    openApprove();
  };

  const handleApproveWithPassword = async () => {
    if (!newPassword.trim()) {
      notifications.show({ title: 'Password Required', message: 'Please assign a password for the ambassador.', color: 'red' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/admin/ambassadors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAmbassador.id,
          password: newPassword.trim(),
          status: 'approved',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to approve ambassador');
      }

      notifications.show({
        title: 'Ambassador Approved',
        message: `${selectedAmbassador.name} has been approved with login password.`,
        color: 'green',
      });

      closeApprove();
      fetchData();
    } catch (err: any) {
      notifications.show({
        title: 'Approval Error',
        message: err.message || 'Could not approve ambassador.',
        color: 'red',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleReject = (amb: any) => {
    setAmbassadorToReject(amb);
  };

  const confirmRejectAmbassador = async () => {
    if (!ambassadorToReject) return;
    setRejecting(true);

    try {
      const res = await fetch('/api/admin/ambassadors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ambassadorToReject.id,
          status: 'rejected',
        }),
      });

      notifications.show({
        title: 'Application Rejected',
        message: `Application for ${ambassadorToReject.name} marked as rejected.`,
        color: 'yellow',
      });
      setAmbassadorToReject(null);
      fetchData();
    } catch (err: any) {
      notifications.show({ title: 'Error', message: 'Could not reject application', color: 'red' });
    } finally {
      setRejecting(false);
    }
  };

  const handleViewReferredBookings = async (amb: any) => {
    setSelectedAmbForBookings(amb);
    setLoadingReferredBookings(true);
    try {
      const res = await fetch(`/api/admin/ambassadors/${amb.id}/bookings`);
      const data = await res.json();
      if (data.success && data.bookings) {
        setReferredBookings(data.bookings);
      } else {
        setReferredBookings([]);
      }
    } catch (err) {
      console.error('Error fetching referred bookings:', err);
      setReferredBookings([]);
    } finally {
      setLoadingReferredBookings(false);
    }
  };

  const handleSaveTiers = async () => {
    setSavingTiers(true);
    try {
      const t1 = tiers.find((t: any) => t.tierLevel === 1);
      const t2 = tiers.find((t: any) => t.tierLevel === 2);

      await fetch('/api/admin/ambassadors/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: t1?.id,
          tierLevel: 1,
          name: 'Tier 1 - Silver Ambassador',
          referralsRequired: Number(tier1Refs),
          voucherAmount: Number(tier1Voucher),
          grantsFreeTicket: true,
          voucherApplicableTo: tier1Applicability || 'both',
        }),
      });

      await fetch('/api/admin/ambassadors/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: t2?.id,
          tierLevel: 2,
          name: 'Tier 2 - Gold Ambassador',
          referralsRequired: Number(tier2Refs),
          voucherAmount: Number(tier2Voucher),
          grantsFreeTicket: true,
          voucherApplicableTo: tier2Applicability || 'both',
        }),
      });

      notifications.show({
        title: 'Tiers Updated',
        message: 'Ambassador milestone requirements and rewards updated.',
        color: 'green',
      });

      closeTiers();
      fetchData();
    } catch (err: any) {
      notifications.show({ title: 'Save Error', message: 'Could not update reward tiers', color: 'red' });
    } finally {
      setSavingTiers(false);
    }
  };

  return (
    <Container size="xl" p={0}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center" gap="md">
          <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
            <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.15em' }}>
              CAMPUS AMBASSADOR &amp; REFERRALS
            </Text>
            <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
              Ambassadors Management
            </Title>
            <Text size="sm" c="gray.4" mt={4}>
              Review applications, assign login passwords, monitor referral counts, and configure milestone tiers.
            </Text>
          </Box>

          <Button
            variant="light"
            color="royalGold"
            onClick={openTiers}
            leftSection={<IconSettings size={18} />}
            style={{ flexShrink: 0 }}
          >
            Configure Reward Tiers
          </Button>
        </Group>

        {/* Metrics Grid */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  PENDING APPLICATIONS
                </Text>
                <Title order={2} size="h3" c="yellow.3" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  {pendingApps.length} Requests
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="yellow" variant="light">
                <IconUsers size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  ACTIVE AMBASSADORS
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  {activeAmbassadors.length} Approved
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="green" variant="light">
                <IconCrown size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  TOTAL REFERRALS GENERATED
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  {ambassadors.reduce((sum, a) => sum + (a.referralCount || 0), 0)} Bookings
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="yellow" variant="light">
                <IconSparkles size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        <Tabs defaultValue={pendingApps.length > 0 ? 'pending' : 'active'} color="yellow" variant="pills">
          <Tabs.List mb="md">
            <Tabs.Tab value="pending" leftSection={<IconUsers size={16} />}>
              Pending Applications ({pendingApps.length})
            </Tabs.Tab>
            <Tabs.Tab value="active" leftSection={<IconCrown size={16} />}>
              Active Ambassadors ({activeAmbassadors.length})
            </Tabs.Tab>
          </Tabs.List>

          {/* ========================================================================= */}
          {/* TAB 1: PENDING APPLICATIONS                                               */}
          {/* ========================================================================= */}
          <Tabs.Panel value="pending">
            <Paper
              p="md"
              radius="lg"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              {pendingApps.length === 0 ? (
                <Text size="sm" c="gray.4" ta="center" py="xl">
                  No pending ambassador applications at this time.
                </Text>
              ) : (
                <Table.ScrollContainer minWidth={900}>
                  <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: 900 }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Ref Code</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Applicant Name</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Mobile Number</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Email</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>College / Notes</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Applied On</Table.Th>
                        <Table.Th style={{ color: '#facc15', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {pendingApps.map((a) => (
                        <Table.Tr key={a.id}>
                          <Table.Td style={{ fontFamily: 'monospace', color: '#fde047', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {a.refCode}
                          </Table.Td>
                          <Table.Td style={{ fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>{a.name}</Table.Td>
                          <Table.Td style={{ color: '#d1d5db', whiteSpace: 'nowrap' }}>{a.mobile}</Table.Td>
                          <Table.Td style={{ color: '#d1d5db', whiteSpace: 'nowrap' }}>{a.email}</Table.Td>
                          <Table.Td style={{ color: '#9ca3af', maxWidth: 220, fontSize: '13px' }}>
                            {a.notes || '—'}
                          </Table.Td>
                          <Table.Td style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <Group gap="xs" justify="flex-end" wrap="nowrap">
                              <Button
                                size="xs"
                                color="green"
                                variant="light"
                                onClick={() => handleOpenApprove(a)}
                                leftSection={<IconCheck size={14} />}
                              >
                                Approve &amp; Set Password
                              </Button>

                              <ActionIcon
                                color="red"
                                variant="light"
                                size="sm"
                                radius="md"
                                onClick={() => handleReject(a)}
                                title="Reject Application"
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Paper>
          </Tabs.Panel>

          {/* ========================================================================= */}
          {/* TAB 2: ACTIVE AMBASSADORS                                                 */}
          {/* ========================================================================= */}
          <Tabs.Panel value="active">
            <Paper
              p="md"
              radius="lg"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              {activeAmbassadors.length === 0 ? (
                <Text size="sm" c="gray.4" ta="center" py="xl">
                  No approved ambassadors registered yet.
                </Text>
              ) : (
                <Table.ScrollContainer minWidth={900}>
                  <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: 900 }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Ref Code</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Ambassador Name</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Mobile</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Referrals</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Current Tier</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Free Pass</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Voucher Balance</Table.Th>
                        <Table.Th style={{ color: '#facc15', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {activeAmbassadors.map((a) => (
                        <Table.Tr key={a.id}>
                          <Table.Td style={{ fontFamily: 'monospace', color: '#fde047', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {a.refCode}
                          </Table.Td>
                          <Table.Td style={{ fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>{a.name}</Table.Td>
                          <Table.Td style={{ color: '#d1d5db', whiteSpace: 'nowrap' }}>{a.mobile}</Table.Td>
                          <Table.Td style={{ fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap' }}>
                            {a.referralCount || 0} bookings
                          </Table.Td>
                          <Table.Td style={{ whiteSpace: 'nowrap' }}>
                            <Badge
                              size="xs"
                              color={a.currentTier >= 2 ? 'green' : a.currentTier === 1 ? 'yellow' : 'gray'}
                              variant="filled"
                              style={{
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                ...(a.currentTier === 1 ? { color: '#140305', fontWeight: 800, backgroundColor: '#facc15' } : {}),
                              }}
                            >
                              {a.currentTier >= 2 ? 'TIER 2 (GOLD)' : a.currentTier === 1 ? 'TIER 1 (SILVER)' : 'TIER 0 (IN PROGRESS)'}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ whiteSpace: 'nowrap' }}>
                            <Badge size="xs" color={a.earnedFreeTicket ? 'green' : 'gray'} variant="light" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                              {a.earnedFreeTicket ? '✓ UNLOCKED' : 'LOCKED'}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ fontWeight: 700, color: '#4ade80', whiteSpace: 'nowrap' }}>
                            ₹{a.voucherBalance || 0}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <Group gap={6} justify="flex-end" wrap="nowrap">
                              <Tooltip label="View Referred Ticket Bookings">
                                <ActionIcon
                                  color="royalGold"
                                  variant="light"
                                  size="sm"
                                  radius="md"
                                  onClick={() => handleViewReferredBookings(a)}
                                >
                                  <IconEye size={16} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Change Password">
                                <ActionIcon
                                  color="yellow"
                                  variant="light"
                                  size="sm"
                                  radius="md"
                                  onClick={() => handleOpenApprove(a)}
                                >
                                  <IconKey size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Approve & Password Modal */}
      <Modal
        opened={openedApprove}
        onClose={closeApprove}
        title={
          <Group gap="xs">
            <IconKey size={20} color="#facc15" />
            <Text fw={700} c="white">
              Assign Ambassador Password: {selectedAmbassador?.name}
            </Text>
          </Group>
        }
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.3)' },
          header: { backgroundColor: '#140305' },
        }}
      >
        <Stack gap="md">
          <Text size="xs" c="gray.4">
            The ambassador will use their registered mobile (<b>{selectedAmbassador?.mobile}</b>) and this password to log in at <code>/ambassador/login</code>.
          </Text>

          <TextInput
            label="Ambassador Password"
            placeholder="Assign password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeApprove} disabled={savingPassword}>
              Cancel
            </Button>
            <Button
              className="btn-auspicious-gold"
              onClick={handleApproveWithPassword}
              loading={savingPassword}
              leftSection={<IconCheck size={16} />}
            >
              Approve &amp; Save Credentials
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Configure Reward Tiers Modal */}
      <Modal
        opened={openedTiers}
        onClose={closeTiers}
        title={
          <Group gap="xs">
            <IconCrown size={20} color="#facc15" />
            <Text fw={700} c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              Configure Ambassador Reward Tiers
            </Text>
          </Group>
        }
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.3)' },
          header: { backgroundColor: '#140305' },
        }}
      >
        <Stack gap="md">
          {/* Tier 1 Configuration */}
          <Paper p="md" radius="md" style={{ backgroundColor: '#1f0406', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <Text size="xs" fw={700} c="royalGold.4" mb="xs">
              TIER 1 (SILVER MILESTONE)
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              <NumberInput
                label="Referrals Required"
                min={1}
                value={tier1Refs}
                onChange={setTier1Refs}
              />
              <NumberInput
                label="Voucher Amount (₹)"
                min={0}
                value={tier1Voucher}
                onChange={setTier1Voucher}
                prefix="₹"
              />
            </SimpleGrid>
            <Select
              label="Voucher Usability"
              data={[
                { value: 'both', label: 'All 35 Stalls (Food + Commercial)' },
                { value: 'food', label: 'Food Stalls Only (1-15)' },
                { value: 'other', label: 'Commercial Stalls Only (A-T)' },
              ]}
              value={tier1Applicability}
              onChange={setTier1Applicability}
              mt="xs"
            />
            <Text size="10px" c="gray.4" mt={4}>
              Grants 1 Free Official Adult Ticket + ₹{tier1Voucher} Stall Voucher upon reaching {tier1Refs} referrals.
            </Text>
          </Paper>

          {/* Tier 2 Configuration */}
          <Paper p="md" radius="md" style={{ backgroundColor: '#1f0406', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <Text size="xs" fw={700} c="royalGold.4" mb="xs">
              TIER 2 (GOLD MILESTONE)
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              <NumberInput
                label="Referrals Required"
                min={1}
                value={tier2Refs}
                onChange={setTier2Refs}
              />
              <NumberInput
                label="Total Voucher Amount (₹)"
                min={0}
                value={tier2Voucher}
                onChange={setTier2Voucher}
                prefix="₹"
              />
            </SimpleGrid>
            <Select
              label="Voucher Usability"
              data={[
                { value: 'both', label: 'All 35 Stalls (Food + Commercial)' },
                { value: 'food', label: 'Food Stalls Only (1-15)' },
                { value: 'other', label: 'Commercial Stalls Only (A-T)' },
              ]}
              value={tier2Applicability}
              onChange={setTier2Applicability}
              mt="xs"
            />
            <Text size="10px" c="gray.4" mt={4}>
              Upgrades total voucher balance to ₹{tier2Voucher}.
            </Text>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeTiers} disabled={savingTiers}>
              Cancel
            </Button>
            <Button
              className="btn-auspicious-gold"
              onClick={handleSaveTiers}
              loading={savingTiers}
              leftSection={<IconCheck size={16} />}
            >
              Save Reward Tiers
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Referred Bookings Details Modal (Collapsible by default) */}
      <Modal
        opened={!!selectedAmbForBookings}
        onClose={() => setSelectedAmbForBookings(null)}
        title={
          selectedAmbForBookings && (
            <Group gap="xs">
              <IconTicket size={22} color="#facc15" />
              <Box>
                <Text fw={700} size="md" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
                  Referred Bookings: {selectedAmbForBookings.name}
                </Text>
                <Text size="xs" c="gray.4">
                  Ref Code: <b style={{ color: '#fde047', fontFamily: 'monospace' }}>{selectedAmbForBookings.refCode}</b> | Mobile: +91 {selectedAmbForBookings.mobile}
                </Text>
              </Box>
            </Group>
          )
        }
        size="lg"
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.4)' },
          header: { backgroundColor: '#140305', borderBottom: '1px solid rgba(234, 179, 8, 0.15)' },
        }}
      >
        <Stack gap="md" py="xs">
          {loadingReferredBookings ? (
            <Center py="xl">
              <Loader color="royalGold" size="md" />
            </Center>
          ) : referredBookings.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <IconTicket size={40} color="#6b7280" />
                <Text size="sm" c="gray.4">
                  No ticket bookings have been registered with referral code <b>{selectedAmbForBookings?.refCode}</b> yet.
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="xs">
              <Text size="xs" c="gray.4">
                Total <b>{referredBookings.length}</b> verified booking{referredBookings.length === 1 ? '' : 's'} referred. Click any booking to view or collapse attendee details:
              </Text>

              <Accordion
                variant="separated"
                radius="md"
                styles={{
                  item: {
                    backgroundColor: '#1f0406',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    marginBottom: 8,
                  },
                  control: {
                    padding: '10px 14px',
                    '&:hover': {
                      backgroundColor: 'rgba(234, 179, 8, 0.08)',
                    },
                  },
                  content: {
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '12px 14px',
                    borderTop: '1px solid rgba(234, 179, 8, 0.15)',
                  },
                }}
              >
                {referredBookings.map((b) => {
                  let childrenParsed: string[] = [];
                  if (b.childrenNames) {
                    try {
                      childrenParsed = typeof b.childrenNames === 'string' ? JSON.parse(b.childrenNames) : b.childrenNames;
                    } catch (e) {
                      childrenParsed = [];
                    }
                  }

                  return (
                    <Accordion.Item key={b.id} value={b.id}>
                      <Accordion.Control>
                        <Group justify="space-between" align="center" wrap="wrap" gap="xs" pr="xs">
                          <Group gap="xs">
                            <Badge
                              color="yellow"
                              variant="filled"
                              className="badge-gold-filled"
                              style={{ fontFamily: 'monospace', fontWeight: 800, color: '#140305', backgroundColor: '#facc15' }}
                              size="xs"
                            >
                              {b.bookingNumber}
                            </Badge>
                            <Text size="sm" fw={700} c="white">
                              {b.fullName}
                            </Text>
                          </Group>

                          <Group gap="xs">
                            <Badge color="blue" variant="light" size="xs">
                              1 Adult{b.childrenCount > 0 ? ` + ${b.childrenCount} Child${b.childrenCount > 1 ? 'ren' : ''}` : ''}
                            </Badge>
                            <Badge color={b.paymentStatus === 'success' ? 'green' : 'yellow'} size="xs">
                              ₹{b.totalAmount}
                            </Badge>
                            <Badge color={b.isCheckedIn ? 'green' : 'gray'} variant="outline" size="xs">
                              {b.isCheckedIn ? 'CHECKED IN' : 'PENDING'}
                            </Badge>
                          </Group>
                        </Group>
                      </Accordion.Control>

                      <Accordion.Panel>
                        <Stack gap="xs">
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                            <Group gap={6}>
                              <IconUser size={15} color="#facc15" />
                              <Text size="xs" c="gray.4">Attendee:</Text>
                              <Text size="xs" fw={600} c="white">{b.fullName}</Text>
                            </Group>

                            <Group gap={6}>
                              <IconPhone size={15} color="#facc15" />
                              <Text size="xs" c="gray.4">Mobile:</Text>
                              <Text size="xs" fw={600} c="white">+91 {b.mobile}</Text>
                            </Group>

                            {b.email && (
                              <Group gap={6}>
                                <IconMail size={15} color="#facc15" />
                                <Text size="xs" c="gray.4">Email:</Text>
                                <Text size="xs" c="gray.2">{b.email}</Text>
                              </Group>
                            )}

                            <Group gap={6}>
                              <IconCalendar size={15} color="#facc15" />
                              <Text size="xs" c="gray.4">Booked On:</Text>
                              <Text size="xs" c="gray.3">{new Date(b.createdAt).toLocaleString('en-IN')}</Text>
                            </Group>
                          </SimpleGrid>

                          <Divider color="rgba(255, 255, 255, 0.08)" my={4} />

                          <Group gap={6} align="flex-start">
                            <IconMapPin size={15} color="#facc15" style={{ flexShrink: 0, marginTop: 2 }} />
                            <Text size="xs" c="gray.4" style={{ flexShrink: 0 }}>Address:</Text>
                            <Text size="xs" c="gray.2">{b.address}</Text>
                          </Group>

                          {childrenParsed.length > 0 && (
                            <Box mt={2}>
                              <Text size="xs" c="gray.4" mb={2}>Children Accompanying:</Text>
                              <Group gap={4}>
                                {childrenParsed.map((childName, cIdx) => (
                                  <Badge key={cIdx} color="grape" variant="light" size="xs">
                                    Child {cIdx + 1}: {childName}
                                  </Badge>
                                ))}
                              </Group>
                            </Box>
                          )}

                          <Group justify="space-between" align="center" mt="xs" pt="xs" style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                            <Group gap="xs">
                              <Text size="xs" c="gray.4">
                                Voucher Balance: <b style={{ color: '#4ade80' }}>₹{b.voucherBalance || 0}</b>
                              </Text>
                              {b.couponCode && (
                                <Badge color="green" size="xs" variant="light">
                                  Coupon: {b.couponCode} (-₹{b.discountAmount || 0})
                                </Badge>
                              )}
                            </Group>

                            <Button
                              component="a"
                              href={`/dandiyaraas/tickets/pass/${b.id}`}
                              target="_blank"
                              size="compact-xs"
                              variant="subtle"
                              color="yellow"
                              leftSection={<IconExternalLink size={12} />}
                            >
                              View Official Pass
                            </Button>
                          </Group>
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </Stack>
          )}

          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={() => setSelectedAmbForBookings(null)}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reject Application Confirmation Modal */}
      <ConfirmationModal
        opened={!!ambassadorToReject}
        onClose={() => setAmbassadorToReject(null)}
        onConfirm={confirmRejectAmbassador}
        title="Reject Ambassador Application"
        description={
          <span>
            Are you sure you want to reject the campus ambassador application for <b>{ambassadorToReject?.name}</b> ({ambassadorToReject?.collegeName || ambassadorToReject?.mobile})?
          </span>
        }
        confirmLabel="Reject Application"
        variant="danger"
        loading={rejecting}
      />
    </Container>
  );
}

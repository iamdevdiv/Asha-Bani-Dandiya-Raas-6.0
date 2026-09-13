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
  Textarea,
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
  IconBrandWhatsapp,
  IconCopy,
  IconSend,
  IconRefresh,
} from '@tabler/icons-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import { DEFAULT_TEMPLATES, renderMessageTemplate } from '@/lib/message-templates-core';
import { openWhatsAppChat } from '@/lib/whatsapp';

export default function AdminAmbassadorsPage() {
  const [loading, setLoading] = useState(true);
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);

  // Approve / Set Password Modal
  const [openedApprove, { open: openApprove, close: closeApprove }] = useDisclosure(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState<'approve' | 'edit'>('approve');

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

  // Message Templates & Credentials Modal State
  const [waTemplates, setWaTemplates] = useState<Record<string, string>>({});
  const [selectedAmbForCredentials, setSelectedAmbForCredentials] = useState<any | null>(null);
  const [credentialsPassword, setCredentialsPassword] = useState('');
  const [credentialsCustomMessage, setCredentialsCustomMessage] = useState('');

  const generateCredentialsMessage = (amb: any, pwd: string) => {
    if (!amb) return '';
    const template = waTemplates['template_ambassador_onboarding_wa'] || DEFAULT_TEMPLATES.template_ambassador_onboarding_wa.defaultText;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ashabani.com';
    const loginUrl = `${origin}/ambassador/login`;
    const refCode = amb.refCode || amb.referralCode || '';
    const referralUrl = `${origin}/dandiyaraas?ref=${refCode}`;

    return renderMessageTemplate(template, {
      name: amb.name || 'Ambassador',
      mobile: amb.mobile || '',
      password: pwd || '[Password to be set by admin]',
      login_url: loginUrl,
      ref_code: refCode,
      referral_url: referralUrl,
      event_date: '13 October 2026',
      venue: 'Maharaja Agrasen Bhavan, Saharanpur',
    });
  };

  const handleOpenSendCredentials = (amb: any, initialPassword = '') => {
    setSelectedAmbForCredentials(amb);
    setCredentialsPassword(initialPassword);
    setCredentialsCustomMessage(generateCredentialsMessage(amb, initialPassword));
  };

  const handlePasswordChangeInCredentialsModal = (val: string) => {
    setCredentialsPassword(val);
    if (selectedAmbForCredentials) {
      setCredentialsCustomMessage(generateCredentialsMessage(selectedAmbForCredentials, val));
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const gen = `Asha@${randomStr}`;
    handlePasswordChangeInCredentialsModal(gen);
  };

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/ambassadors').then((res) => res.json()),
      fetch('/api/admin/ambassadors/tiers').then((res) => res.json()),
      fetch('/api/admin/message-templates').then((res) => res.json()).catch(() => null),
    ])
      .then(([ambData, tierData, templateData]) => {
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
        if (templateData?.success && templateData?.templates) {
          setWaTemplates(templateData.templates);
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
    setPasswordModalMode('approve');
    setNewPassword(''); // Always start blank without showing template password
    openApprove();
  };

  const handleOpenChangePassword = (amb: any) => {
    setSelectedAmbassador(amb);
    setPasswordModalMode('edit');
    setNewPassword(''); // Always start blank
    openApprove();
  };

  const handleClosePasswordModal = () => {
    setNewPassword('');
    closeApprove();
  };

  const handleSavePassword = async () => {
    if (!newPassword.trim()) {
      notifications.show({ title: 'Password Required', message: 'Please enter a password.', color: 'red' });
      return;
    }

    if (newPassword.trim().length < 6) {
      notifications.show({ title: 'Password Too Short', message: 'Password must be at least 6 characters long.', color: 'red' });
      return;
    }

    setSavingPassword(true);
    try {
      const isEdit = passwordModalMode === 'edit';
      const res = await fetch('/api/admin/ambassadors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAmbassador.id,
          password: newPassword.trim(),
          status: 'approved',
          action: isEdit ? 'change_password' : 'approve',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isEdit ? 'Failed to update password' : 'Failed to approve ambassador'));
      }

      notifications.show({
        title: isEdit ? 'Password Updated' : 'Ambassador Approved',
        message: isEdit
          ? `Login password for ${selectedAmbassador.name} has been updated successfully.`
          : `${selectedAmbassador.name} has been approved with login password.`,
        color: 'green',
      });

      const updatedAmb = data.ambassador || { ...selectedAmbassador, status: 'approved' };
      const savedPwd = newPassword.trim();
      handleClosePasswordModal();
      fetchData();

      // Automatically open Send Credentials modal with the saved password
      handleOpenSendCredentials(updatedAmb, savedPwd);
    } catch (err: any) {
      notifications.show({
        title: passwordModalMode === 'edit' ? 'Update Error' : 'Approval Error',
        message: err.message || 'Could not save ambassador credentials.',
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
            disabled={loading}
          >
            Configure Reward Tiers
          </Button>
        </Group>

        {loading ? (
          <Paper
            p="xl"
            radius="lg"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <Stack align="center" py={80} gap="md">
              <Loader color="royalGold" size="lg" />
              <Text size="sm" c="gray.3" fw={600} style={{ letterSpacing: '0.05em' }}>
                Loading ambassador applications and referral statistics...
              </Text>
            </Stack>
          </Paper>
        ) : (
          <>
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
                              <Tooltip label="Send Welcome & Credentials (WhatsApp)">
                                <ActionIcon
                                  color="green"
                                  variant="light"
                                  size="sm"
                                  radius="md"
                                  onClick={() => handleOpenSendCredentials(a)}
                                >
                                  <IconBrandWhatsapp size={16} />
                                </ActionIcon>
                              </Tooltip>
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
                                  onClick={() => handleOpenChangePassword(a)}
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
        </>
      )}
      </Stack>

      {/* Approve & Password Modal */}
      <Modal
        opened={openedApprove}
        onClose={handleClosePasswordModal}
        title={
          <Group gap="xs">
            <IconKey size={20} color="#facc15" />
            <Text fw={700} c="white">
              {passwordModalMode === 'edit'
                ? `Change Password: ${selectedAmbassador?.name}`
                : `Assign Ambassador Password: ${selectedAmbassador?.name}`}
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
            {passwordModalMode === 'edit' ? (
              <>
                Enter a new password for <b>{selectedAmbassador?.name}</b> (Mobile: <b>{selectedAmbassador?.mobile}</b>). This will immediately replace their existing login credentials at <code>/ambassador/login</code>.
              </>
            ) : (
              <>
                The ambassador will use their registered mobile (<b>{selectedAmbassador?.mobile}</b>) and this password to log in at <code>/ambassador/login</code>.
              </>
            )}
          </Text>

          <PasswordInput
            label={passwordModalMode === 'edit' ? 'New Login Password' : 'Set Login Password'}
            placeholder="Enter new password (min. 6 characters)"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleClosePasswordModal} disabled={savingPassword}>
              Cancel
            </Button>
            <Button
              className="btn-auspicious-gold"
              onClick={handleSavePassword}
              loading={savingPassword}
              leftSection={passwordModalMode === 'edit' ? <IconKey size={16} /> : <IconCheck size={16} />}
            >
              {passwordModalMode === 'edit' ? 'Update Password' : 'Approve & Save Credentials'}
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
                            <IconMapPin size={15} color="#facc15" className="icon-align-text" />
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

      {/* Send Ambassador Welcome & Credentials Modal */}
      <Modal
        opened={!!selectedAmbForCredentials}
        onClose={() => setSelectedAmbForCredentials(null)}
        size="lg"
        radius="lg"
        title={
          <Group gap="xs">
            <ThemeIcon color="green" variant="light" size="md" radius="xl">
              <IconBrandWhatsapp size={18} />
            </ThemeIcon>
            <Text fw={700} c="white" style={{ fontFamily: "'Cinzel', serif" }}>
              Send Welcome & Credentials (WhatsApp)
            </Text>
          </Group>
        }
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.3)' },
          header: { backgroundColor: '#140305' },
        }}
      >
        {selectedAmbForCredentials && (
          <Stack gap="md">
            <Paper p="sm" radius="md" style={{ backgroundColor: '#1f0406', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                <Box>
                  <Text size="10px" c="gray.4" fw={700}>AMBASSADOR NAME</Text>
                  <Text size="xs" fw={700} c="white">{selectedAmbForCredentials.name}</Text>
                </Box>
                <Box>
                  <Text size="10px" c="gray.4" fw={700}>MOBILE (PRE-FILLED)</Text>
                  <Text size="xs" fw={700} c="green.3">
                    +91 {selectedAmbForCredentials.mobile}
                  </Text>
                </Box>
                <Box>
                  <Text size="10px" c="gray.4" fw={700}>REFERRAL CODE</Text>
                  <Badge size="xs" color="yellow" variant="light">
                    {selectedAmbForCredentials.refCode || selectedAmbForCredentials.referralCode || 'Pending'}
                  </Badge>
                </Box>
                <Box>
                  <Text size="10px" c="gray.4" fw={700}>LOGIN PORTAL</Text>
                  <Text size="xs" c="yellow.2">/ambassador/login</Text>
                </Box>
              </SimpleGrid>
            </Paper>

            <Group justify="space-between" align="flex-end">
              <TextInput
                label="Login Password to Include"
                description="Enter or generate the password to be communicated to the ambassador"
                placeholder="Enter password (e.g. Asha@2026)"
                value={credentialsPassword}
                onChange={(e) => handlePasswordChangeInCredentialsModal(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Button
                variant="light"
                color="yellow"
                size="sm"
                onClick={handleGenerateRandomPassword}
                leftSection={<IconRefresh size={14} />}
              >
                Generate
              </Button>
            </Group>

            <Stack gap={4}>
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="gray.3">
                  EDITABLE WHATSAPP MESSAGE
                </Text>
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  leftSection={<IconRefresh size={12} />}
                  onClick={() => {
                    setCredentialsCustomMessage(generateCredentialsMessage(selectedAmbForCredentials, credentialsPassword));
                    notifications.show({ title: 'Template Reset', message: 'Message restored to admin template default', color: 'yellow' });
                  }}
                >
                  Reset to Template Default
                </Button>
              </Group>

              <Textarea
                minRows={9}
                maxRows={16}
                autosize
                value={credentialsCustomMessage}
                onChange={(e) => setCredentialsCustomMessage(e.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: '#0a0102',
                    borderColor: 'rgba(234, 179, 8, 0.35)',
                    color: '#fef08a',
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '12.5px',
                    lineHeight: '1.45',
                  },
                }}
              />
            </Stack>

            <Divider color="rgba(234, 179, 8, 0.2)" />

            <Group justify="space-between" wrap="wrap" gap="sm">
              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedAmbForCredentials(null)}
              >
                Close
              </Button>

              <Group gap="xs">
                <Button
                  variant="light"
                  color="yellow"
                  size="sm"
                  leftSection={<IconCopy size={16} />}
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(credentialsCustomMessage);
                      notifications.show({
                        title: 'Copied!',
                        message: 'Message copied to clipboard',
                        color: 'green',
                      });
                    }
                  }}
                >
                  Copy Message
                </Button>

                <Button
                  color="teal"
                  variant="filled"
                  size="sm"
                  leftSection={<IconBrandWhatsapp size={16} />}
                  onClick={() => {
                    openWhatsAppChat(selectedAmbForCredentials.mobile || '', credentialsCustomMessage);
                    notifications.show({
                      title: 'Opening WhatsApp',
                      message: `Opening chat for ${selectedAmbForCredentials.name}...`,
                      color: 'green',
                    });
                  }}
                  style={{ fontWeight: 700 }}
                >
                  Send on WhatsApp
                </Button>
              </Group>
            </Group>
          </Stack>
        )}
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

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
  SimpleGrid,
  Grid,
  Card,
  TextInput,
  NumberInput,
  Select,
  Switch,
  Modal,
  Badge,
  ActionIcon,
  ThemeIcon,
  Alert,
  Loader,
  Center,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCalendarEvent,
  IconPlus,
  IconPencil,
  IconTrash,
  IconSparkles,
  IconCheck,
  IconBuildingStore,
  IconClock,
  IconRuler,
  IconUsers,
  IconCalendar,
} from '@tabler/icons-react';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminTicketPhasesPage() {
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Global Settings Form
  const [ticketOpeningDate, setTicketOpeningDate] = useState('2026-09-01');
  const [ticketOpeningTime, setTicketOpeningTime] = useState('00:00');
  const [ticketBookingMsg, setTicketBookingMsg] = useState('Ticket bookings start from 1 September 2026');
  const [maxChildren, setMaxChildren] = useState<number | string>(3);
  const [childHeightLimit, setChildHeightLimit] = useState<number | string>(55);
  const [universalVoucherApplicability, setUniversalVoucherApplicability] = useState<string | null>('both');

  // Phase Modal Form
  const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingPhase, setEditingPhase] = useState<any | null>(null);
  const [savingPhase, setSavingPhase] = useState(false);

  // Delete Confirmation
  const [phaseToDelete, setPhaseToDelete] = useState<any | null>(null);
  const [deletingPhase, setDeletingPhase] = useState(false);

  const [phaseNumber, setPhaseNumber] = useState<number | string>(1);
  const [phaseName, setPhaseName] = useState('');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-10');
  const [adultPrice, setAdultPrice] = useState<number | string>(499);
  const [childPrice, setChildPrice] = useState<number | string>(199);
  const [voucherAmount, setVoucherAmount] = useState<number | string>(100);
  const [phaseActive, setPhaseActive] = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch('/api/tickets/phases').then((res) => res.json()),
      fetch('/api/settings').then((res) => res.json()),
    ])
      .then(([phaseData, settingsData]) => {
        if (phaseData.success && phaseData.phases) {
          setPhases(phaseData.phases);
        }
        if (settingsData.success && settingsData.settings) {
          setSettings(settingsData.settings);
          setTicketOpeningDate(settingsData.settings.ticket_booking_start_date || '2026-09-01');
          setTicketOpeningTime(settingsData.settings.ticket_booking_start_time || '00:00');
          setTicketBookingMsg(settingsData.settings.ticket_booking_msg || 'Ticket bookings start from 1 September 2026');
          setMaxChildren(settingsData.settings.max_children_per_ticket || 3);
          setChildHeightLimit(settingsData.settings.child_height_limit_inches || 55);
          setUniversalVoucherApplicability(settingsData.settings.ticket_voucher_applicable_to || 'both');
        }
      })
      .catch((err) => console.error('Error fetching phases and settings:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_booking_start_date: ticketOpeningDate,
          ticket_booking_start_time: ticketOpeningTime,
          ticket_booking_msg: ticketBookingMsg,
          max_children_per_ticket: String(maxChildren),
          child_height_limit_inches: String(childHeightLimit),
          ticket_voucher_applicable_to: universalVoucherApplicability || 'both',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save settings');
      }

      notifications.show({
        title: 'Settings Saved',
        message: 'Global ticket rules, voucher stall access, and schedule updated.',
        color: 'green',
      });
      fetchData();
    } catch (err: any) {
      notifications.show({
        title: 'Save Error',
        message: err.message || 'Could not update settings.',
        color: 'red',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenAddPhase = () => {
    setEditingPhase(null);
    setPhaseNumber(phases.length + 1);
    setPhaseName(`Phase ${phases.length + 1} - Regular`);
    setStartDate('2026-09-11');
    setEndDate('2026-09-20');
    setAdultPrice(599);
    setChildPrice(199);
    setVoucherAmount(100);
    setPhaseActive(true);
    openModal();
  };

  const handleOpenEditPhase = (p: any) => {
    setEditingPhase(p);
    setPhaseNumber(p.phaseNumber);
    setPhaseName(p.name);
    setStartDate(p.startDate);
    setEndDate(p.endDate);
    setAdultPrice(p.adultPrice);
    setChildPrice(p.childPrice);
    setVoucherAmount(p.voucherAmount || 100);
    setPhaseActive(p.isActive !== false);
    openModal();
  };

  const handleSavePhase = async () => {
    if (!phaseName.trim()) {
      notifications.show({ title: 'Name Required', message: 'Please enter a phase name.', color: 'red' });
      return;
    }

    if (startDate > endDate) {
      notifications.show({
        title: 'Date Order Error',
        message: 'Phase start date cannot be after end date.',
        color: 'red',
      });
      return;
    }

    setSavingPhase(true);
    try {
      const res = await fetch('/api/tickets/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPhase?.id,
          phaseNumber: Number(phaseNumber),
          name: phaseName.trim(),
          startDate,
          endDate,
          adultPrice: Number(adultPrice),
          childPrice: Number(childPrice),
          voucherAmount: Number(voucherAmount),
          isActive: phaseActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save phase');
      }

      notifications.show({
        title: 'Phase Saved & Dates Synchronized',
        message: Number(phaseNumber) === 1
          ? 'Phase 1 saved. Global ticket opening start date and Phase 2 start dates synchronized.'
          : `Phase ${phaseNumber} saved. Adjacent phase start/end dates automatically synchronized.`,
        color: 'green',
      });

      closeModal();
      fetchData();
    } catch (err: any) {
      notifications.show({
        title: 'Save Failed',
        message: err.message || 'Could not save phase.',
        color: 'red',
      });
    } finally {
      setSavingPhase(false);
    }
  };

  const confirmDeletePhase = async () => {
    if (!phaseToDelete) return;
    setDeletingPhase(true);

    try {
      const res = await fetch(`/api/tickets/phases?id=${phaseToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete phase');
      }

      notifications.show({
        title: 'Phase Deleted',
        message: `${phaseToDelete.name} has been removed.`,
        color: 'green',
      });
      setPhaseToDelete(null);
      fetchData();
    } catch (err: any) {
      notifications.show({
        title: 'Delete Failed',
        message: err.message || 'Could not delete phase.',
        color: 'red',
      });
    } finally {
      setDeletingPhase(false);
    }
  };

  return (
    <Container size="xl" p={0}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center" gap="md">
          <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
            <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.15em' }}>
              TICKET PHASES &amp; PRICING MODULE
            </Text>
            <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
              Ticket Phases &amp; Rules
            </Title>
            <Text size="sm" c="gray.4" mt={4}>
              Manage time-phased pricing, included stall vouchers, child height limits, and dynamic opening dates.
            </Text>
          </Box>

          <Button
            className="btn-auspicious-gold"
            onClick={handleOpenAddPhase}
            leftSection={<IconPlus size={18} />}
            style={{ flexShrink: 0 }}
          >
            Add New Phase
          </Button>
        </Group>

        {/* ========================================================================= */}
        {/* 1. GLOBAL TICKET OPENING & CHILD RULES                                    */}
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
            <Group gap="xs">
              <IconClock size={20} color="#facc15" />
              <Title order={2} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                Ticket Opening &amp; Child Pass Rules (Timezone GMT +5:30)
              </Title>
            </Group>

            <Grid gap="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  label="Ticket Opening Date"
                  type="date"
                  required
                  value={ticketOpeningDate}
                  onChange={(e) => setTicketOpeningDate(e.currentTarget.value)}
                  description="Strictly evaluated in Indian Standard Time (IST)"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  label="Ticket Opening Time"
                  type="time"
                  value={ticketOpeningTime}
                  onChange={(e) => setTicketOpeningTime(e.currentTarget.value)}
                  description="24-hour time format"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <NumberInput
                  label="Max Children Per Ticket"
                  min={1}
                  max={10}
                  value={maxChildren}
                  onChange={setMaxChildren}
                  description="Max accompanying children allowed"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <NumberInput
                  label="Child Height Limit (Inches)"
                  min={30}
                  max={70}
                  value={childHeightLimit}
                  onChange={setChildHeightLimit}
                  description="Height threshold verified at gate (default: 55&quot;)"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                  label="Universal Voucher Stall Usability"
                  data={[
                    { value: 'both', label: 'All 35 Stalls (Food 1–15 + Commercial A–T)' },
                    { value: 'food', label: 'Food Stalls Only (Stalls 1–15)' },
                    { value: 'other', label: 'Commercial & Shopping Stalls (Stalls A–T)' },
                  ]}
                  value={universalVoucherApplicability}
                  onChange={setUniversalVoucherApplicability}
                  description="Where customer vouchers are valid (applies to all bookings)"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
                <TextInput
                  label="Pre-Opening Announcement Banner Text"
                  placeholder="Enter announcement notice displayed when ticket booking is closed"
                  value={ticketBookingMsg}
                  onChange={(e) => setTicketBookingMsg(e.currentTarget.value)}
                  description="Notice displayed on homepage when ticket booking is closed"
                />
              </Grid.Col>
            </Grid>



            <Group justify="flex-end" mt="xs">
              <Button
                variant="light"
                color="royalGold"
                onClick={handleSaveSettings}
                loading={savingSettings}
                leftSection={<IconCheck size={16} />}
              >
                Save Global Rules
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* ========================================================================= */}
        {/* 2. PRICING PHASES CARDS GRID                                              */}
        {/* ========================================================================= */}
        <Box>
          <Text size="xs" fw={700} c="royalGold.4" mb="md" style={{ letterSpacing: '0.1em' }}>
            CONFIGURED PRICING PHASES ({phases.length})
          </Text>

          {loading ? (
            <Center py="xl">
              <Loader color="royalGold" size="md" />
            </Center>
          ) : phases.length === 0 ? (
            <Text size="sm" c="gray.4" ta="center" py="xl">
              No pricing phases found. Click &quot;Add New Phase&quot; to initialize.
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {phases.map((p) => (
                <Paper
                  key={p.id}
                  p="xl"
                  radius="xl"
                  style={{
                    backgroundColor: 'rgba(20, 3, 5, 0.85)',
                    border: p.isActive ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                  }}
                  className="festive-card"
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <Badge color="yellow" variant="filled" size="sm" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
                      Phase #{p.phaseNumber}
                    </Badge>
                    <Badge color={p.isActive ? 'green' : 'gray'} variant="filled" size="xs">
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </Group>

                  <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    {p.name}
                  </Title>

                  <Group gap={6} mt={6} align="center" wrap="nowrap">
                    <IconCalendar size={14} color="#facc15" style={{ flexShrink: 0 }} />
                    <Text size="xs" c="gray.4" lh={1}>
                      {p.startDate} to {p.endDate}
                    </Text>
                  </Group>

                  <Divider my="sm" color="rgba(234, 179, 8, 0.2)" />

                  <Stack gap={6}>
                    <Group justify="space-between">
                      <Text size="sm" c="gray.3">
                        Adult Pass Price:
                      </Text>
                      <Text size="sm" fw={700} c="white">
                        ₹{p.adultPrice}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="gray.3">
                        Child Pass Price:
                      </Text>
                      <Text size="sm" fw={700} c="white">
                        ₹{p.childPrice}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="gray.3">
                        Included Stall Voucher:
                      </Text>
                      <Text size="sm" fw={700} c="yellow.3">
                        ₹{p.voucherAmount || 100}
                      </Text>
                    </Group>
                  </Stack>

                  <Divider my="sm" color="rgba(234, 179, 8, 0.2)" />

                  <Group justify="flex-end" gap="xs">
                    <ActionIcon
                      variant="light"
                      color="yellow"
                      size="md"
                      radius="md"
                      onClick={() => handleOpenEditPhase(p)}
                      title="Edit Phase"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>

                    <ActionIcon
                      variant="light"
                      color="red"
                      size="md"
                      radius="md"
                      onClick={() => setPhaseToDelete(p)}
                      title="Delete Phase"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Stack>

      {/* Add / Edit Phase Modal */}
      <Modal
        opened={openedModal}
        onClose={closeModal}
        title={
          <Group gap="xs">
            <IconCalendarEvent size={20} color="#facc15" />
            <Title order={3} size="h4" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              {editingPhase ? `Edit Phase #${phaseNumber}` : 'Create New Pricing Phase'}
            </Title>
          </Group>
        }
        centered
        radius="lg"
        styles={{
          content: {
            backgroundColor: '#140305',
            border: '1px solid rgba(234, 179, 8, 0.4)',
          },
          header: {
            backgroundColor: '#140305',
            borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
          },
        }}
      >
        <Stack gap="md">
          <TextInput
            label="Phase Display Name"
            placeholder="Enter phase name"
            required
            value={phaseName}
            onChange={(e) => setPhaseName(e.currentTarget.value)}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Phase Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.currentTarget.value)}
              description={
                Number(phaseNumber) === 1
                  ? 'Syncs with Global Ticket Booking Opening Date'
                  : `Syncs with Phase ${Number(phaseNumber) - 1}'s end date`
              }
            />
            <TextInput
              label="Phase End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.currentTarget.value)}
              description={
                phases.some((p) => p.phaseNumber === Number(phaseNumber) + 1)
                  ? `Syncs with Phase ${Number(phaseNumber) + 1}'s start date`
                  : 'Last day of ticket sales for this phase'
              }
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Adult Ticket Price (₹)"
              min={0}
              required
              value={adultPrice}
              onChange={setAdultPrice}
              description="Per adult attendee pass"
            />
            <NumberInput
              label="Child Ticket Price (₹)"
              min={0}
              required
              value={childPrice}
              onChange={setChildPrice}
              description="Accompanying child under 55&quot;"
            />
          </SimpleGrid>

          <NumberInput
            label="Free Stall Voucher (₹)"
            min={0}
            value={voucherAmount}
            onChange={setVoucherAmount}
            description="Included coupon balance per pass (stall access is configured universally above)"
          />

          <Switch
            label="Phase Active / Enabled"
            checked={phaseActive}
            onChange={(e) => setPhaseActive(e.currentTarget.checked)}
            color="yellow"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeModal} disabled={savingPhase}>
              Cancel
            </Button>
            <Button
              className="btn-auspicious-gold"
              onClick={handleSavePhase}
              loading={savingPhase}
              leftSection={<IconCheck size={16} />}
            >
              Save Phase
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        opened={!!phaseToDelete}
        onClose={() => setPhaseToDelete(null)}
        onConfirm={confirmDeletePhase}
        title="Delete Pricing Phase"
        description={
          <span>
            Are you sure you want to permanently delete <b>{phaseToDelete?.name}</b>? Attendees will no longer be able to book passes under this pricing tier.
          </span>
        }
        confirmLabel="Delete Phase"
        variant="danger"
        loading={deletingPhase}
      />
    </Container>
  );
}

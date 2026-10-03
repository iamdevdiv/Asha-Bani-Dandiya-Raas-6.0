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
  Modal,
  TextInput,
  NumberInput,
  Select,
  Switch,
  Badge,
  Loader,
  Card,
  Divider,
  ActionIcon,
  Tooltip,
  Alert,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingStore,
  IconCoin,
  IconCheck,
  IconX,
  IconEdit,
  IconUser,
  IconPhone,
  IconMail,
  IconCalendar,
  IconRefresh,
  IconPlus,
  IconTrash,
  IconLink,
  IconExternalLink,
  IconCopy,
  IconInfoCircle,
  IconAlertCircle,
  IconUsers,
} from '@tabler/icons-react';
import { InteractiveStallGrid, StallItem } from '@/components/InteractiveStallGrid';

export default function AdminStallsPage() {
  const [stalls, setStalls] = useState<StallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState<StallItem | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [saving, setSaving] = useState(false);

  // Dynamic team members in stall modal
  const [modalTeamMembers, setModalTeamMembers] = useState<string[]>(['', '']);
  const [modalGenerateBookingLink, setModalGenerateBookingLink] = useState<boolean>(false);
  const [modalSendSms, setModalSendSms] = useState<boolean>(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const form = useForm({
    initialValues: {
      price: 3500,
      isBooked: false,
      bookedByName: '',
      bookedByBrand: '',
      bookedByMobile: '',
      bookedByEmail: '',
      stallType: 'Commercial Canopy',
      paymentMethod: 'Cash',
      paymentStatus: 'success',
    },
  });

  // Category & Badge Pricing Modal State
  const [openedCategoryModal, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [savingCategoryPrices, setSavingCategoryPrices] = useState(false);

  const categoryForm = useForm({
    initialValues: {
      foodPrice: 3500,
      cjPrice: 3500,
      turningPrice: 4500,
      frontPrice: 5500,
    },
  });

  const handleOpenCategoryModal = () => {
    const foodPrice = stalls.find((s) => s.section === 'food' || !isNaN(Number(s.stallNumber)))?.price ?? 3500;
    const cjPrice = stalls.find((s) => s.stallNumber.toUpperCase() === 'C' || s.section === 'outstanding_visibility')?.price ?? 3500;
    const turningPrice = stalls.find((s) => ['A', 'B', 'Q', 'R', 'S', 'T'].includes(s.stallNumber.toUpperCase()) || s.section === 'turning_premium')?.price ?? 4500;
    const frontPrice = stalls.find((s) => ['K', 'L', 'M', 'N', 'O', 'P'].includes(s.stallNumber.toUpperCase()) || s.section === 'front_visibility')?.price ?? 5500;

    categoryForm.setValues({
      foodPrice,
      cjPrice,
      turningPrice,
      frontPrice,
    });
    openCategoryModal();
  };

  const handleSaveCategoryPrices = async (values: typeof categoryForm.values) => {
    setSavingCategoryPrices(true);
    try {
      const res = await fetch('/api/admin/stalls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_category_pricing',
          categoryPrices: values,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update category prices');
      }

      notifications.show({
        title: 'Category Prices Updated',
        message: 'All stall booth prices & layout badges have been updated successfully.',
        color: 'green',
      });

      closeCategoryModal();
      fetchStalls();
    } catch (err: any) {
      notifications.show({
        title: 'Update Failed',
        message: err.message || 'Could not save category prices.',
        color: 'red',
      });
    } finally {
      setSavingCategoryPrices(false);
    }
  };

  const fetchStalls = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stalls');
      const data = await res.json();
      if (data.success) {
        setStalls(data.stalls);
      }
    } catch (err) {
      console.error('Failed to load stalls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  const handleOpenStallModal = (stall: StallItem) => {
    setSelectedStall(stall);
    const defaultType = stall.stallType || (stall.section === 'food' || !isNaN(Number(stall.stallNumber)) ? 'Food Stall' : 'Commercial Canopy');
    form.setValues({
      price: stall.price,
      isBooked: Boolean(stall.isBooked),
      bookedByName: stall.bookedByName || '',
      bookedByBrand: stall.bookedByBrand || '',
      bookedByMobile: stall.bookedByMobile || '',
      bookedByEmail: stall.bookedByEmail || '',
      stallType: defaultType,
      paymentMethod: stall.paymentMethod || 'Cash',
      paymentStatus: stall.isBooked ? (stall.paymentStatus || 'success') : 'pending',
    });

    // Parse team members
    const membersList = (stall.teamMembers || stall.bookedByName || '')
      .split(/[,&]|\band\b/i)
      .map((m: string) => m.trim())
      .filter(Boolean);

    setModalTeamMembers(membersList.length > 0 ? membersList : ['', '']);
    setModalGenerateBookingLink(false); // DEFAULT: OFF
    setModalSendSms(false);
    open();
  };

  const handleSelectStallInModal = (stallNo: string) => {
    const s = stalls.find((item) => item.stallNumber.toUpperCase() === stallNo.toUpperCase());
    if (s) {
      handleOpenStallModal(s);
    }
  };

  const handleSaveStall = async (values: typeof form.values) => {
    if (!selectedStall) return;
    setSaving(true);

    try {
      const cleanTeam = modalTeamMembers.map((m) => m.trim()).filter(Boolean);
      const cleanMobile = values.bookedByMobile ? values.bookedByMobile.replace(/\D/g, '') : '';

      // If digital pass link generation is requested, validate contact person & mobile
      if (values.isBooked && modalGenerateBookingLink) {
        if (!values.bookedByName.trim()) {
          notifications.show({ title: 'Validation Error', message: 'Contact person full name is required to generate digital pass link.', color: 'red' });
          setSaving(false);
          return;
        }
        if (!values.bookedByBrand.trim()) {
          notifications.show({ title: 'Validation Error', message: 'Brand or business name is required to generate digital pass link.', color: 'red' });
          setSaving(false);
          return;
        }
        if (cleanMobile.length < 10) {
          notifications.show({ title: 'Validation Error', message: 'Valid 10-digit mobile number is required to generate digital pass link.', color: 'red' });
          setSaving(false);
          return;
        }
        if (values.paymentStatus !== 'success') {
          notifications.show({
            title: 'Payment Pending',
            message: 'Pass link cannot be generated for pending payments. Please confirm payment or turn off link generation.',
            color: 'yellow',
          });
          setSaving(false);
          return;
        }
      }

      const effectivePaymentStatus = values.isBooked ? (values.paymentStatus || 'success') : 'pending';

      const res = await fetch('/api/admin/stalls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stallNumber: selectedStall.stallNumber,
          price: values.price,
          isBooked: values.isBooked,
          bookedByName: values.bookedByName.trim(),
          bookedByBrand: values.bookedByBrand.trim(),
          bookedByMobile: cleanMobile,
          bookedByEmail: values.bookedByEmail.trim() || undefined,
          stallType: values.stallType.trim(),
          paymentMethod: values.paymentMethod,
          paymentStatus: effectivePaymentStatus,
          teamMembers: cleanTeam,
          generateBookingLink: effectivePaymentStatus === 'success' && modalGenerateBookingLink, // optional, turned off by default
          sendSms: modalSendSms,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update stall');
      }

      notifications.show({
        title: 'Stall Saved',
        message: data.message || `Stall ${selectedStall.stallNumber} details saved successfully.`,
        color: 'green',
      });

      close();
      fetchStalls();
    } catch (err: any) {
      notifications.show({
        title: 'Save Failed',
        message: err.message || 'Could not save stall changes.',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateLinkForStall = async () => {
    if (!selectedStall) return;
    if (form.values.paymentStatus !== 'success' && selectedStall.paymentStatus !== 'success') {
      notifications.show({
        title: 'Payment Pending',
        message: 'Digital pass link cannot be generated for pending payments. Please confirm payment first.',
        color: 'yellow',
      });
      return;
    }
    setGeneratingLink(true);
    try {
      const res = await fetch('/api/admin/stalls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stallNumber: selectedStall.stallNumber,
          action: 'generate_link',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate link');
      }
      notifications.show({
        title: 'Digital Pass Link Generated',
        message: `Live pass URL and QR code generated for Stall ${selectedStall.stallNumber}.`,
        color: 'green',
      });
      if (data.stall) setSelectedStall(data.stall);
      fetchStalls();
    } catch (err: any) {
      notifications.show({
        title: 'Generation Failed',
        message: err.message || 'Could not generate pass link.',
        color: 'red',
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = (text: string, title = 'Copied') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      notifications.show({
        title,
        message: text,
        color: 'teal',
      });
    }
  };

  // Stats calculation
  const totalStalls = stalls.length;
  const bookedStalls = stalls.filter((s) => s.isBooked).length;
  const availableStalls = totalStalls - bookedStalls;
  const totalRevenue = stalls
    .filter((s) => s.isBooked)
    .reduce((acc, s) => acc + (s.price || 0) + (s.extraMembersAmount || 0), 0);

  return (
    <Container size="xl" p={0}>
      {/* Header */}
      <Group justify="space-between" align="center" mb="lg" gap="md">
        <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
            Interactive Stall Layout &amp; Pricing Manager
          </Title>
          <Text size="sm" c="gray.4">
            Click any stall booth to edit pricing, directly issue a booking, manage team members, or view digital pass links.
          </Text>
        </Box>

        <Group gap="sm" wrap="wrap">
          <Button
            onClick={handleOpenCategoryModal}
            className="btn-auspicious-gold"
            leftSection={<IconCoin size={16} />}
            style={{ flexShrink: 0 }}
          >
            Edit Badge &amp; Category Prices
          </Button>
          <Button
            onClick={fetchStalls}
            variant="light"
            color="royalGold"
            leftSection={<IconRefresh size={16} />}
            style={{ flexShrink: 0 }}
          >
            Refresh Grid
          </Button>
        </Group>
      </Group>

      {/* Summary KPI Cards */}
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="md" mb="xl">
        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: 'rgba(36, 8, 14, 0.7)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}
        >
          <Text size="xs" fw={700} c="dimmed">
            TOTAL STALLS
          </Text>
          <Text size="xl" fw={900} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            {totalStalls}
          </Text>
          <Text size="xs" c="gray.4">
            35 Booths (15 Food + 20 Commercial)
          </Text>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: 'rgba(36, 8, 14, 0.7)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}
        >
          <Text size="xs" fw={700} c="dimmed">
            BOOKED STALLS
          </Text>
          <Text size="xl" fw={900} c="green.4" style={{ fontFamily: "'Cinzel', serif" }}>
            {bookedStalls}
          </Text>
          <Text size="xs" c="gray.4">
            {totalStalls > 0 ? ((bookedStalls / totalStalls) * 100).toFixed(0) : 0}% Occupancy
          </Text>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: 'rgba(36, 8, 14, 0.7)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}
        >
          <Text size="xs" fw={700} c="dimmed">
            AVAILABLE BOOTHS
          </Text>
          <Text size="xl" fw={900} c="blue.4" style={{ fontFamily: "'Cinzel', serif" }}>
            {availableStalls}
          </Text>
          <Text size="xs" c="gray.4">
            Ready for reservation
          </Text>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: 'rgba(36, 8, 14, 0.7)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}
        >
          <Text size="xs" fw={700} c="dimmed">
            REVENUE (BOOKED)
          </Text>
          <Text size="xl" fw={900} c="yellow.3" style={{ fontFamily: "'Cinzel', serif" }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </Text>
          <Text size="xs" c="gray.4">
            Confirmed booth allotments
          </Text>
        </Paper>
      </SimpleGrid>

      {/* Main Interactive Grid */}
      <Paper
        p="md"
        radius="lg"
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.8)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
        }}
      >
        {loading ? (
          <Stack align="center" py={60}>
            <Loader color="royalGold" size="lg" />
            <Text c="gray.4" size="sm">
              Loading interactive stall layout...
            </Text>
          </Stack>
        ) : (
          <InteractiveStallGrid
            stalls={stalls}
            selectedStallNumber={selectedStall?.stallNumber}
            onSelectStall={handleOpenStallModal}
            onAdminAction={handleOpenStallModal}
            isAdminView={true}
          />
        )}
      </Paper>

      {/* =======================================================================
          MODAL: EDIT STALL, ALLOTMENT & TEAM MEMBERS (ALL FIELDS VISIBLE)
          ======================================================================= */}
      <Modal
        opened={opened}
        onClose={close}
        size="lg"
        centered
        radius="xl"
        title={
          selectedStall && (
            <Group gap="xs">
              <ThemeIcon color="yellow" variant="light" size="md" radius="md">
                <IconBuildingStore size={18} />
              </ThemeIcon>
              <Text fw={700} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem' }}>
                Manage Stall #{selectedStall.stallNumber}
              </Text>
              <Badge color={selectedStall.isBooked ? 'red' : 'green'} variant="light">
                {selectedStall.isBooked ? 'Reserved / Booked' : 'Available'}
              </Badge>
            </Group>
          )
        }
        styles={{
          content: {
            backgroundColor: '#140305',
            border: '1px solid rgba(234, 179, 8, 0.4)',
          },
          header: {
            backgroundColor: '#140305',
            borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
          },
        }}
      >
        {selectedStall && (
          <form onSubmit={form.onSubmit(handleSaveStall)}>
            <Stack gap="md" pt="xs">
              <Alert
                icon={<IconInfoCircle size={18} />}
                color="yellow"
                variant="light"
                radius="md"
                styles={{
                  root: { backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)' },
                  message: { color: '#e2e8f0', fontSize: '0.85rem' },
                }}
              >
                Configure booth pricing, issue or update exhibitor reservations, manage pass attendees, and control digital booking links. All fields are accessible regardless of booked or unbooked status.
              </Alert>

              {/* Section 1: Stall Selection & Exhibitor Info */}
              <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
                <Text size="xs" fw={700} c="royalGold.4" mb="xs" style={{ letterSpacing: '0.05em' }}>
                  1. STALL SELECTION &amp; EXHIBITOR INFO
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <Select
                    label="Select Stall Booth"
                    placeholder="Choose stall"
                    data={stalls.map((s) => ({
                      value: s.stallNumber,
                      label: `Stall ${s.stallNumber} - ₹${s.price?.toLocaleString('en-IN')} (${
                        s.isBooked ? 'Reserved / Booked' : 'Available'
                      })`,
                    }))}
                    value={selectedStall.stallNumber}
                    onChange={(val) => val && handleSelectStallInModal(val)}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                  />

                  <TextInput
                    label="Brand / Business Name"
                    placeholder="e.g. Royal Sweets & Snacks"
                    leftSection={<IconBuildingStore size={14} color="#facc15" />}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('bookedByBrand')}
                  />

                  <TextInput
                    label="Contact Person Full Name"
                    placeholder="e.g. Rajesh Kumar"
                    leftSection={<IconUser size={14} color="#facc15" />}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('bookedByName')}
                  />

                  <TextInput
                    label="10-Digit Mobile Number"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    leftSection={<Text size="xs" c="gray.4">+91</Text>}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('bookedByMobile')}
                  />

                  <TextInput
                    label="Email Address (Optional)"
                    placeholder="e.g. contact@business.com"
                    leftSection={<IconMail size={14} color="#facc15" />}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('bookedByEmail')}
                  />

                  <TextInput
                    label="Stall Category / Products"
                    placeholder="e.g. Food Stall, Garments, Jewellery"
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('stallType')}
                  />
                </SimpleGrid>

                {selectedStall.bookedAt && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Reserved on: {new Date(selectedStall.bookedAt).toLocaleString('en-IN')}
                  </Text>
                )}
              </Paper>

              {/* Section 2: Pricing & Payment Method */}
              <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
                <Text size="xs" fw={700} c="royalGold.4" mb="xs" style={{ letterSpacing: '0.05em' }}>
                  2. PRICING &amp; PAYMENT DETAILS
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  <NumberInput
                    label="Allotment Amount / Price (₹)"
                    description="Base rate or custom negotiated fee"
                    placeholder="Enter price"
                    min={0}
                    leftSection={<IconCoin size={16} color="#facc15" />}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('price')}
                  />

                  <Select
                    label="Payment Method"
                    data={[
                      { value: 'Cash', label: 'Cash Payment' },
                      { value: 'UPI', label: 'UPI / QR Transfer' },
                      { value: 'Bank Transfer', label: 'NEFT / RTGS / Bank Transfer' },
                      { value: 'Complimentary / Sponsor', label: 'Complimentary / Sponsor (₹0)' },
                      { value: 'Cheque', label: 'Cheque' },
                      { value: 'Online', label: 'Pre-paid Online' },
                    ]}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('paymentMethod')}
                  />

                  <Select
                    label="Payment Status"
                    data={[
                      { value: 'success', label: 'Paid & Confirmed' },
                      { value: 'pending', label: 'Pending Payment' },
                    ]}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                      label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                    }}
                    {...form.getInputProps('paymentStatus')}
                  />
                </SimpleGrid>

                <Box mt="sm">
                  <Switch
                    label="Mark Booth as Booked / Reserved"
                    description="Toggle active reservation allotment status for this stall"
                    color="yellow"
                    size="md"
                    {...form.getInputProps('isBooked', { type: 'checkbox' })}
                  />
                </Box>
              </Paper>

              {/* Section 3: Allotted Team Members Management */}
              <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
                <Group justify="space-between" mb="xs">
                  <Box>
                    <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.05em' }}>
                      3. EXHIBITOR TEAM MEMBER PASSES ({modalTeamMembers.length} PASSES)
                    </Text>
                    <Text size="11px" c="gray.4">
                      2 passes included by default. Add or modify member names attending the booth.
                    </Text>
                  </Box>
                  <Button
                    size="xs"
                    variant="light"
                    color="yellow"
                    leftSection={<IconPlus size={13} />}
                    onClick={() => setModalTeamMembers([...modalTeamMembers, ''])}
                  >
                    Add Member
                  </Button>
                </Group>
                <Stack gap="xs" mt="xs">
                  {modalTeamMembers.map((m, idx) => (
                    <Group key={idx} gap="xs" wrap="nowrap">
                      <TextInput
                        placeholder={`Member #${idx + 1} Name`}
                        value={m}
                        onChange={(e) => {
                          const updated = [...modalTeamMembers];
                          updated[idx] = e.currentTarget.value;
                          setModalTeamMembers(updated);
                        }}
                        style={{ flex: 1 }}
                        styles={{
                          input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                        }}
                      />
                      {modalTeamMembers.length > 1 && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => setModalTeamMembers(modalTeamMembers.filter((_, i) => i !== idx))}
                        >
                          <IconTrash size={15} />
                        </ActionIcon>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Paper>

              {/* Section 4: Digital Pass / Booking Link Options */}
              <Paper
                p="sm"
                radius="md"
                style={{
                  backgroundColor: selectedStall.qrCodeDataUrl ? 'rgba(6, 44, 20, 0.5)' : 'rgba(234, 179, 8, 0.05)',
                  border: selectedStall.qrCodeDataUrl ? '1px solid #22c55e' : '1px dashed rgba(234, 179, 8, 0.35)',
                }}
              >
                {selectedStall.qrCodeDataUrl ? (
                  <Group justify="space-between" align="center" wrap="wrap">
                    <Box>
                      <Text size="xs" fw={700} c="#4ade80">
                        ✓ Digital Pass Link Active
                      </Text>
                      <Text size="11px" c="gray.3">
                        Pass URL: {typeof window !== 'undefined' ? `${window.location.origin}/dandiyaraas/stall/pass/${selectedStall.bookingId}` : ''}
                      </Text>
                    </Box>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="green"
                        variant="light"
                        leftSection={<IconCopy size={13} />}
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/dandiyaraas/stall/pass/${selectedStall.bookingId}`,
                            'Pass URL Copied'
                          )
                        }
                      >
                        Copy Link
                      </Button>
                      <Button
                        size="xs"
                        color="cyan"
                        variant="light"
                        component="a"
                        href={`/dandiyaraas/stall/pass/${selectedStall.bookingId}`}
                        target="_blank"
                        leftSection={<IconExternalLink size={13} />}
                      >
                        Open
                      </Button>
                    </Group>
                  </Group>
                ) : selectedStall.isBooked && selectedStall.bookingId ? (
                  <Stack gap="xs">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={700} c="yellow.3">
                          Digital Pass Not Generated (Offline Allotment)
                        </Text>
                        <Text size="11px" c="gray.4">
                          {form.values.paymentStatus === 'success'
                            ? 'No public pass URL exists for this stall yet. Click to generate immediately.'
                            : 'Payment status is Pending. Payment must be confirmed before digital pass links can be generated.'}
                        </Text>
                      </Box>
                      <Button
                        size="xs"
                        color="yellow"
                        variant="filled"
                        disabled={form.values.paymentStatus !== 'success'}
                        loading={generatingLink}
                        leftSection={<IconLink size={14} />}
                        onClick={handleGenerateLinkForStall}
                      >
                        Generate Pass Link Now
                      </Button>
                    </Group>
                    {form.values.paymentStatus !== 'success' && (
                      <Alert
                        icon={<IconAlertCircle size={15} />}
                        color="yellow"
                        variant="light"
                        radius="md"
                        styles={{
                          root: { backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)' },
                          message: { color: '#fde047', fontSize: '0.8rem' },
                        }}
                      >
                        Payment is marked as <strong>Pending Payment</strong>. Digital booking link and QR pass generation is not allowed until payment is confirmed.
                      </Alert>
                    )}
                  </Stack>
                ) : (
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={700} c="yellow.3">
                          Generate Public Booking Link &amp; Pass
                        </Text>
                        <Text size="11px" c="gray.4">
                          Optional (turned <strong>OFF by default</strong>). If OFF, stall is reserved offline without creating a pass URL.
                        </Text>
                      </Box>
                      <Switch
                        checked={form.values.paymentStatus === 'success' && modalGenerateBookingLink}
                        disabled={form.values.paymentStatus !== 'success'}
                        onChange={(e) => setModalGenerateBookingLink(e.currentTarget.checked)}
                        color="yellow"
                        size="md"
                      />
                    </Group>

                    {form.values.paymentStatus !== 'success' && (
                      <Alert
                        icon={<IconAlertCircle size={16} />}
                        color="yellow"
                        variant="light"
                        radius="md"
                        styles={{
                          root: { backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)' },
                          message: { color: '#fde047', fontSize: '0.8rem' },
                        }}
                      >
                        Payment is marked as <strong>Pending Payment</strong>. Digital booking link and QR pass generation is not allowed until payment is confirmed.
                      </Alert>
                    )}

                    {form.values.paymentStatus === 'success' && modalGenerateBookingLink && (
                      <>
                        <Divider my={4} color="rgba(234, 179, 8, 0.2)" />
                        <Group justify="space-between" align="center">
                          <Box style={{ flex: 1 }}>
                            <Text size="xs" fw={600} c="white">
                              Dispatch Confirmation SMS to Exhibitor
                            </Text>
                            <Text size="11px" c="gray.4">
                              Send automated SMS via TextBee to +91 {form.values.bookedByMobile || 'exhibitor'} with pass details.
                            </Text>
                          </Box>
                          <Switch
                            checked={modalSendSms}
                            onChange={(e) => setModalSendSms(e.currentTarget.checked)}
                            color="green"
                            size="sm"
                          />
                        </Group>
                      </>
                    )}
                  </Stack>
                )}
              </Paper>

              <Group justify="flex-end" gap="sm" mt="md">
                <Button variant="default" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="btn-auspicious-gold">
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>

      {/* Category & Badge Pricing Modal */}
      <Modal
        opened={openedCategoryModal}
        onClose={closeCategoryModal}
        title={
          <Group gap="xs">
            <IconCoin size={22} color="#facc15" />
            <Text fw={800} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem' }}>
              Edit Stall Category &amp; Badge Pricing
            </Text>
          </Group>
        }
        size="md"
        styles={{
          content: {
            backgroundColor: '#140305',
            border: '1px solid rgba(234, 179, 8, 0.4)',
          },
          header: {
            backgroundColor: '#140305',
            borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
          },
        }}
      >
        <Text size="xs" c="gray.4" mb="md">
          Updating these prices will update the catalog price for all booths in the corresponding category and instantly reflect on both this admin panel and the public stall booking page badges.
        </Text>

        <form onSubmit={categoryForm.onSubmit(handleSaveCategoryPrices)}>
          <Stack gap="md">
            <NumberInput
              label="Food Stalls (1 to 15) Price"
              description="Booths #1–15 layout rate"
              placeholder="3500"
              min={0}
              leftSection={<IconCoin size={16} color="#facc15" />}
              {...categoryForm.getInputProps('foodPrice')}
            />

            <NumberInput
              label="Turning Premium Stalls (A, B, Q, R, S, T) Price"
              description="High footfall corner booths"
              placeholder="4500"
              min={0}
              leftSection={<IconCoin size={16} color="#facc15" />}
              {...categoryForm.getInputProps('turningPrice')}
            />

            <NumberInput
              label="Front Visibility Stalls (K, L, M, N, O, P) Price"
              description="Prominent main stage front booths"
              placeholder="5500"
              min={0}
              leftSection={<IconCoin size={16} color="#facc15" />}
              {...categoryForm.getInputProps('frontPrice')}
            />

            <NumberInput
              label="Outstanding Visibility Stalls (C) Price"
              description="Special visibility booth"
              placeholder="3500"
              min={0}
              leftSection={<IconCoin size={16} color="#facc15" />}
              {...categoryForm.getInputProps('cjPrice')}
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button variant="default" onClick={closeCategoryModal}>
                Cancel
              </Button>
              <Button type="submit" loading={savingCategoryPrices} className="btn-auspicious-gold">
                Save All Category Prices
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
  TextInput,
  NumberInput,
  Select,
  Switch,
  Modal,
  Loader,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  Alert,
  Divider,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconReceipt,
  IconEye,
  IconRefresh,
  IconDownload,
  IconBuildingStore,
  IconCreditCard,
  IconUser,
  IconPhone,
  IconMail,
  IconCalendar,
  IconBrandWhatsapp,
  IconScan,
  IconTrash,
  IconExternalLink,
  IconCheck,
  IconMessage,
  IconEdit,
  IconPlus,
  IconCopy,
  IconInfoCircle,
  IconLink,
  IconSparkles,
  IconUsers,
  IconAlertCircle,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { ExhibitorPassCard } from '@/components/ExhibitorPassCard';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { renderMessageTemplate, DEFAULT_TEMPLATES } from '@/lib/message-templates-core';
import { INITIAL_STALLS } from '@/lib/stall-data';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [stallsList, setStallsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>('all');
  const [filterEntryStatus, setFilterEntryStatus] = useState<string | null>('all');
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Confirm Stall Payment State
  const [confirmingStallId, setConfirmingStallId] = useState<string | null>(null);
  const [resendingSmsId, setResendingSmsId] = useState<string | null>(null);

  // Delete Order Confirmation State
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [bookingToDelete, setBookingToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [stallWaTemplate, setStallWaTemplate] = useState<string>('');

  // ---------------------------------------------------------------------------
  // DIRECT STALL BOOKING ISSUANCE STATE
  // ---------------------------------------------------------------------------
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [creatingStallBooking, setCreatingStallBooking] = useState(false);
  const [newStallNumber, setNewStallNumber] = useState<string>('');
  const [newBookerName, setNewBookerName] = useState<string>('');
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newMobile, setNewMobile] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newStallType, setNewStallType] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number | string>(3500);
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>('Cash');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('success');
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>(['', '']);
  const [newGenerateBookingLink, setNewGenerateBookingLink] = useState<boolean>(false); // TURNED OFF BY DEFAULT
  const [newSendSms, setNewSendSms] = useState<boolean>(false);

  // Created Booking Success Modal State
  const [successModalOpened, setSuccessModalOpened] = useState(false);
  const [issuedBookingResult, setIssuedBookingResult] = useState<any | null>(null);

  // ---------------------------------------------------------------------------
  // EDIT STALL BOOKING DETAILS STATE
  // ---------------------------------------------------------------------------
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [generatingLinkForId, setGeneratingLinkForId] = useState<string | null>(null);
  const [editBookingId, setEditBookingId] = useState<string>('');
  const [editBookingNumber, setEditBookingNumber] = useState<string>('');
  const [editStallNumber, setEditStallNumber] = useState<string>('');
  const [editBookerName, setEditBookerName] = useState<string>('');
  const [editBrandName, setEditBrandName] = useState<string>('');
  const [editMobile, setEditMobile] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editStallType, setEditStallType] = useState<string>('');
  const [editAmount, setEditAmount] = useState<number | string>(3500);
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('success');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('Manual');
  const [editTeamMembers, setEditTeamMembers] = useState<string[]>([]);
  const [editQrCodeDataUrl, setEditQrCodeDataUrl] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [bookingsRes, stallsRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/stalls'),
      ]);

      const data = await bookingsRes.json();
      if (data.success) {
        setBookings(data.bookings);
      }

      const stallsData = await stallsRes.json();
      if (stallsData.success) {
        setStallsList(stallsData.stalls);
      }
    } catch (err) {
      console.error('Failed to load bookings or stalls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const sendWhatsAppMessage = (b: any) => {
    const passUrl = typeof window !== 'undefined' ? `${window.location.origin}/dandiyaraas/stall/success?bookingId=${b.id}` : '';
    const template = stallWaTemplate || DEFAULT_TEMPLATES.template_stall_wa.defaultText;
    const displayName = (b.brandName || b.bookerName || 'Exhibitor').toUpperCase();

    const normalizedStall = (b.stallNumber || '').trim().toUpperCase();
    const stallDef = INITIAL_STALLS.find((s) => s.stallNumber.toUpperCase() === normalizedStall);
    const sectionLabel = b.stallSection || b.stall?.sectionLabel || b.stall?.section || stallDef?.sectionLabel || (b.stallType === 'food' ? 'Food Stall' : 'Commercial Canopy');
    const rawPrice = b.amount ?? b.price ?? b.amountPaid ?? stallDef?.defaultPrice ?? 0;
    const formattedPrice = typeof rawPrice === 'number' ? rawPrice.toLocaleString('en-IN') : String(rawPrice);

    const msg = renderMessageTemplate(template, {
      brand_or_name: displayName,
      name: b.bookerName || 'Exhibitor',
      brand_name: b.brandName || b.bookerName || 'Exhibitor',
      stall_number: b.stallNumber || '',
      stall_section: sectionLabel,
      stall_type: sectionLabel,
      price: formattedPrice,
      amount: formattedPrice,
      booking_id: b.bookingNumber || '',
      event_date: 'Tuesday, 13 October 2026',
      venue: 'Maharaja Agrasen Bhavan, Aggarwal Dharamshala, Saharanpur',
      setup_time: '4:00 PM',
      event_hours: '6:00 PM to 12:00 AM',
      team_members: b.teamMembers || b.bookerName || 'Exhibitor Team',
      pass_link: b.qrCodeDataUrl ? passUrl : '(Offline Allotment - Collect badge at counter)',
      booking_link: passUrl,
      helpline: '+91 6399063455',
    });

    openWhatsAppChat(b.mobile || '', msg);

    notifications.show({
      title: 'WhatsApp Opened',
      message: `Message dispatched for ${b.bookerName}.`,
      color: 'green',
    });
  };

  const handleConfirmStallPayment = async (b: any) => {
    setConfirmingStallId(b.id);
    try {
      const res = await fetch('/api/admin/bookings/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: b.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to confirm stall booking');
      }
      notifications.show({
        title: 'Payment Confirmed',
        message: data.message || `Stall #${b.stallNumber} booking marked as confirmed. Pass package generated.`,
        color: 'green',
      });
      fetchBookings();
      if (selectedBooking && selectedBooking.id === b.id) {
        setSelectedBooking(data.booking);
      }
    } catch (err: any) {
      notifications.show({
        title: 'Confirmation Failed',
        message: err.message || 'Could not confirm stall booking.',
        color: 'red',
      });
    } finally {
      setConfirmingStallId(null);
    }
  };

  const handleResendSms = async (b: any) => {
    setResendingSmsId(b.id);
    try {
      const res = await fetch('/api/admin/bookings/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: b.id, forceResendSms: true, sendSms: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send SMS');
      }
      notifications.show({
        title: 'SMS Dispatched',
        message: `Booking confirmation SMS has been resent to +91 ${b.mobile}.`,
        color: 'green',
      });
    } catch (err: any) {
      notifications.show({
        title: 'SMS Failed',
        message: err.message || 'Could not dispatch SMS.',
        color: 'red',
      });
    } finally {
      setResendingSmsId(null);
    }
  };

  const handlePromptDelete = (b: any) => {
    setBookingToDelete(b);
    openDelete();
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete booking');
      }
      notifications.show({
        title: 'Booking Deleted',
        message: `Stall #${bookingToDelete.stallNumber} booking was permanently removed and stall is now available.`,
        color: 'green',
      });
      closeDelete();
      fetchBookings();
      if (selectedBooking?.id === bookingToDelete.id) {
        close();
      }
    } catch (err: any) {
      notifications.show({
        title: 'Deletion Failed',
        message: err.message || 'Could not delete booking.',
        color: 'red',
      });
    } finally {
      setDeleting(false);
      setBookingToDelete(null);
    }
  };

  // ---------------------------------------------------------------------------
  // DIRECT STALL BOOKING ISSUANCE HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenCreateModal = () => {
    // Pick the first available stall as default if available
    const available = stallsList.find((s) => !s.isBooked);
    const defaultStall = available ? available.stallNumber : (stallsList[0]?.stallNumber || '1');
    const defaultStallObj = stallsList.find((s) => s.stallNumber === defaultStall);

    setNewStallNumber(defaultStall);
    setNewBookerName('');
    setNewBrandName('');
    setNewMobile('');
    setNewEmail('');
    setNewStallType(
      defaultStallObj?.section === 'food' || !isNaN(Number(defaultStall))
        ? 'Food Stall'
        : 'Commercial Canopy'
    );
    setNewAmount(defaultStallObj?.price || 3500);
    setNewPaymentMethod('Cash');
    setNewPaymentStatus('success');
    setNewTeamMembers(['', '']);
    setNewGenerateBookingLink(false); // DEFAULT: OFF
    setNewSendSms(false);
    setCreateModalOpened(true);
  };

  const handleSelectStallForNewBooking = (stallNo: string) => {
    setNewStallNumber(stallNo);
    const s = stallsList.find((st) => st.stallNumber.toUpperCase() === stallNo.toUpperCase());
    if (s) {
      setNewAmount(s.price || 3500);
      setNewStallType(
        s.section === 'food' || !isNaN(Number(s.stallNumber))
          ? 'Food Stall'
          : 'Commercial Canopy'
      );
    }
  };

  const handleNewTeamMemberChange = (index: number, value: string) => {
    const updated = [...newTeamMembers];
    updated[index] = value;
    setNewTeamMembers(updated);
  };

  const handleAddNewTeamMember = () => {
    setNewTeamMembers([...newTeamMembers, '']);
  };

  const handleRemoveNewTeamMember = (index: number) => {
    if (newTeamMembers.length <= 1) return;
    setNewTeamMembers(newTeamMembers.filter((_, i) => i !== index));
  };

  const handleCreateStallBookingSubmit = async () => {
    if (!newStallNumber) {
      notifications.show({ title: 'Validation Error', message: 'Please select a stall number.', color: 'red' });
      return;
    }
    if (!newBookerName.trim()) {
      notifications.show({ title: 'Validation Error', message: 'Please enter booker full name.', color: 'red' });
      return;
    }
    if (!newBrandName.trim()) {
      notifications.show({ title: 'Validation Error', message: 'Please enter brand or business name.', color: 'red' });
      return;
    }
    const cleanMobile = newMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      notifications.show({ title: 'Validation Error', message: 'Please enter a valid 10-digit mobile number.', color: 'red' });
      return;
    }

    if (newGenerateBookingLink && newPaymentStatus !== 'success') {
      notifications.show({
        title: 'Pending Payment',
        message: 'Pass link cannot be generated for pending payments. Please confirm payment or turn off link generation.',
        color: 'yellow',
      });
      return;
    }

    setCreatingStallBooking(true);
    try {
      const res = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stallNumber: newStallNumber,
          bookerName: newBookerName.trim(),
          brandName: newBrandName.trim(),
          mobile: cleanMobile,
          email: newEmail.trim() || undefined,
          stallType: newStallType.trim() || 'Commercial Canopy',
          amount: Number(newAmount),
          paymentStatus: newPaymentStatus,
          paymentMethod: newPaymentMethod,
          teamMembers: newTeamMembers.map((m) => m.trim()).filter(Boolean),
          generateBookingLink: newGenerateBookingLink, // OPTIONAL (turned off by default)
          sendSms: newSendSms,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to issue stall booking');
      }

      notifications.show({
        title: 'Stall Booking Issued!',
        message: data.message || `Stall #${newStallNumber} reserved successfully.`,
        color: 'green',
      });

      setCreateModalOpened(false);
      setIssuedBookingResult(data.booking);
      setSuccessModalOpened(true);
      fetchBookings();
    } catch (err: any) {
      notifications.show({
        title: 'Issuance Failed',
        message: err.message || 'Could not issue stall booking.',
        color: 'red',
      });
    } finally {
      setCreatingStallBooking(false);
    }
  };

  // ---------------------------------------------------------------------------
  // EDIT STALL BOOKING & TEAM MEMBERS HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenEditModal = (b: any) => {
    setEditBookingId(b.id);
    setEditBookingNumber(b.bookingNumber || '');
    setEditStallNumber(b.stallNumber || '');
    setEditBookerName(b.bookerName || '');
    setEditBrandName(b.brandName || '');
    setEditMobile(b.mobile || '');
    setEditEmail(b.email || '');
    setEditStallType(b.stallType || 'Commercial Canopy');
    setEditAmount(b.amount || 3500);
    setEditPaymentStatus(b.paymentStatus || 'success');
    setEditPaymentMethod(b.razorpayPaymentId?.startsWith('ADMIN_') ? 'Manual Admin' : 'Online / Other');
    setEditQrCodeDataUrl(b.qrCodeDataUrl || null);

    // Parse existing team members
    const membersList = (b.teamMembers || b.bookerName || '')
      .split(/[,&]|\band\b/i)
      .map((m: string) => m.trim())
      .filter(Boolean);

    setEditTeamMembers(membersList.length > 0 ? membersList : [b.bookerName || 'Exhibitor 1', 'Exhibitor 2']);
    setEditModalOpened(true);
  };

  const handleEditTeamMemberChange = (index: number, val: string) => {
    const updated = [...editTeamMembers];
    updated[index] = val;
    setEditTeamMembers(updated);
  };

  const handleAddEditTeamMember = () => {
    setEditTeamMembers([...editTeamMembers, '']);
  };

  const handleRemoveEditTeamMember = (index: number) => {
    if (editTeamMembers.length <= 1) return;
    setEditTeamMembers(editTeamMembers.filter((_, i) => i !== index));
  };

  const isStallAlreadyConfirmed = (booking: any) => {
    const normStall = (booking.stallNumber || '').trim().toUpperCase();
    if (!normStall) return false;

    // 1. Another confirmed booking exists for this stall
    const hasOtherConfirmedBooking = bookings.some(
      (other) =>
        other.id !== booking.id &&
        (other.stallNumber || '').trim().toUpperCase() === normStall &&
        other.paymentStatus === 'success'
    );
    if (hasOtherConfirmedBooking) return true;

    // 2. The stall in live layout is marked as booked by another booking or offline
    const stallObj = stallsList.find(
      (s) => (s.stallNumber || '').trim().toUpperCase() === normStall
    );
    if (stallObj && stallObj.isBooked && stallObj.bookingId !== booking.id) {
      return true;
    }

    return false;
  };

  const handleSaveEditBooking = async (generateLinkNow = false) => {
    if (!editBookingId) return;

    if (editPaymentStatus === 'success' && isStallAlreadyConfirmed({ id: editBookingId, stallNumber: editStallNumber })) {
      notifications.show({
        title: 'Duplicate Stall Conflict',
        message: `Stall #${editStallNumber} is already confirmed and occupied by another booking. A stall cannot have two bookers.`,
        color: 'red',
      });
      return;
    }

    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/bookings/${editBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookerName: editBookerName.trim(),
          brandName: editBrandName.trim(),
          mobile: editMobile.trim(),
          email: editEmail.trim(),
          stallNumber: editStallNumber.trim(),
          stallType: editStallType.trim(),
          amount: Number(editAmount),
          paymentStatus: editPaymentStatus,
          paymentMethod: editPaymentMethod,
          teamMembers: editTeamMembers.map((m) => m.trim()).filter(Boolean),
          generateBookingLink: generateLinkNow || Boolean(editQrCodeDataUrl),
          forceRegenerateLink: generateLinkNow,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update stall booking');
      }

      notifications.show({
        title: 'Stall Booking Saved',
        message: data.message || `Stall #${editStallNumber} details updated successfully.`,
        color: 'green',
      });

      setEditModalOpened(false);
      fetchBookings();

      if (selectedBooking && selectedBooking.id === editBookingId) {
        setSelectedBooking(data.booking);
      }
    } catch (err: any) {
      notifications.show({
        title: 'Save Failed',
        message: err.message || 'Could not save stall changes.',
        color: 'red',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleGenerateLinkForBooking = async (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking && targetBooking.paymentStatus !== 'success') {
      notifications.show({
        title: 'Payment Pending',
        message: 'Digital pass link cannot be generated for pending payments. Please confirm payment first.',
        color: 'yellow',
      });
      return;
    }

    setGeneratingLinkForId(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generateBookingLink: true,
          forceRegenerateLink: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate pass link');
      }

      notifications.show({
        title: 'Digital Pass Link Generated!',
        message: `Live pass URL and QR code generated for Stall #${data.booking.stallNumber}.`,
        color: 'green',
      });

      if (editModalOpened && editBookingId === bookingId) {
        setEditQrCodeDataUrl(data.booking.qrCodeDataUrl);
      }

      fetchBookings();

      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(data.booking);
      }
    } catch (err: any) {
      notifications.show({
        title: 'Link Generation Failed',
        message: err.message || 'Could not generate booking link.',
        color: 'red',
      });
    } finally {
      setGeneratingLinkForId(null);
    }
  };

  const copyToClipboard = (text: string, title = 'Copied to Clipboard') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      notifications.show({
        title,
        message: text,
        color: 'teal',
      });
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchesQuery =
      !search ||
      b.brandName?.toLowerCase().includes(q) ||
      b.bookerName?.toLowerCase().includes(q) ||
      b.mobile?.includes(q) ||
      b.bookingNumber?.toLowerCase().includes(q) ||
      b.stallNumber?.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'all' || b.paymentStatus === filterStatus;

    let matchesEntry = true;
    if (filterEntryStatus === 'entered') matchesEntry = b.isCheckedIn;
    if (filterEntryStatus === 'unentered') matchesEntry = !b.isCheckedIn;

    let matchesDate = true;
    if (filterDate && b.createdAt) {
      const bookingDay = dayjs(b.createdAt).format('YYYY-MM-DD');
      matchesDate = filterDate === bookingDay;
    }

    return matchesQuery && matchesStatus && matchesEntry && matchesDate;
  });

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    open();
  };

  return (
    <Container size="xl" p={0}>
      <Group justify="space-between" align="center" mb="lg" gap="md">
        <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
            Stall Bookings &amp; Transactions
          </Title>
          <Text size="sm" c="gray.4">
            Manage exhibitor reservations, issue direct stall bookings, modify member names, and view digital passes.
          </Text>
        </Box>

        <Group gap="sm" wrap="wrap">
          <Button
            onClick={handleOpenCreateModal}
            className="btn-auspicious-gold"
            leftSection={<IconBuildingStore size={18} />}
            style={{ flexShrink: 0 }}
          >
            Issue Stall Booking
          </Button>

          <Button
            onClick={fetchBookings}
            variant="light"
            color="royalGold"
            leftSection={<IconRefresh size={16} />}
            style={{ flexShrink: 0 }}
          >
            Refresh Data
          </Button>
        </Group>
      </Group>

      {/* Filter Toolbar */}
      <Paper
        p="md"
        radius="lg"
        mb="lg"
        style={{
          backgroundColor: 'rgba(36, 8, 14, 0.7)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
        }}
      >
        <Group justify="space-between" wrap="wrap" gap="md">
          <TextInput
            placeholder="Search by brand, name, mobile, booking ref..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} color="#facc15" />}
            style={{ flexGrow: 1, minWidth: 240 }}
          />

          <DatePickerInput
            placeholder="Filter by Booking Date"
            value={filterDate}
            onChange={setFilterDate}
            clearable
            leftSection={<IconCalendar size={16} color="#facc15" />}
            style={{ width: 190 }}
          />

          <Select
            data={[
              { value: 'all', label: 'All Payment Statuses' },
              { value: 'success', label: 'Paid & Confirmed' },
              { value: 'pending', label: 'Pending Payment' },
              { value: 'failed', label: 'Failed' },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 180 }}
          />

          <Select
            data={[
              { value: 'all', label: 'All Entry Statuses' },
              { value: 'entered', label: 'Checked In / Entered' },
              { value: 'unentered', label: 'Pending Entry / Unentered' },
            ]}
            value={filterEntryStatus}
            onChange={setFilterEntryStatus}
            style={{ width: 195 }}
          />
        </Group>
      </Paper>

      {/* Bookings Table */}
      <Paper
        p="md"
        radius="lg"
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.8)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <Stack align="center" py={60}>
            <Loader color="royalGold" size="lg" />
            <Text c="gray.4" size="sm">
              Loading stall booking records...
            </Text>
          </Stack>
        ) : filteredBookings.length === 0 ? (
          <Stack align="center" py={50}>
            <ThemeIcon size={52} radius="50%" color="yellow" variant="light">
              <IconBuildingStore size={28} color="#facc15" />
            </ThemeIcon>
            <Text c="gray.4" size="md" fw={600}>
              No stall bookings found
            </Text>
            <Text c="gray.6" size="xs">
              Directly issue a stall booking above or change your search query.
            </Text>
            <Button
              mt="xs"
              onClick={handleOpenCreateModal}
              className="btn-auspicious-gold"
              leftSection={<IconPlus size={16} />}
            >
              Issue Stall Booking Now
            </Button>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={900}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.3)' }}>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>REF #</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>STALL</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>BRAND &amp; BOOKER</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>TEAM / PASSES</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>AMOUNT</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>DIGITAL PASS</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>PAYMENT</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>GATE ENTRY</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem' }}>DATE</Table.Th>
                  <Table.Th style={{ color: '#facc15', fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredBookings.map((b) => {
                  const hasLink = Boolean(b.qrCodeDataUrl);
                  const passUrl = typeof window !== 'undefined' ? `${window.location.origin}/dandiyaraas/stall/pass/${b.id}` : '';

                  return (
                    <Table.Tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Text size="xs" fw={700} c="royalGold.3">
                          {b.bookingNumber}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Badge color="yellow" variant="light" size="md">
                          Stall {b.stallNumber}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={700} c="white">
                          {b.brandName}
                        </Text>
                        <Text size="11px" c="gray.4">
                          {b.bookerName} • +91 {b.mobile}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ maxWidth: 200 }}>
                        <Text size="xs" c="gray.2" lineClamp={1} title={b.teamMembers}>
                          {b.teamMembers || b.bookerName}
                        </Text>
                        {b.extraMembersCount > 0 && (
                          <Badge size="xs" color="yellow" variant="outline">
                            +{b.extraMembersCount} Extra
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Text size="xs" fw={700} c="white">
                          ₹{(b.totalAmount || b.amount)?.toLocaleString('en-IN')}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        {hasLink ? (
                          <Badge
                            color="cyan"
                            variant="light"
                            size="sm"
                            leftSection={<IconLink size={12} />}
                            style={{ cursor: 'pointer' }}
                            onClick={() => copyToClipboard(passUrl, 'Pass Link Copied')}
                            title="Click to copy pass URL"
                          >
                            PASS ACTIVE
                          </Badge>
                        ) : (
                          <Tooltip label="Booking link was not generated (Offline allotment). Click to generate now.">
                            <Badge
                              color="gray"
                              variant="outline"
                              size="sm"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleGenerateLinkForBooking(b.id)}
                            >
                              OFFLINE (NO LINK)
                            </Badge>
                          </Tooltip>
                        )}
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Badge
                          color={
                            b.paymentStatus === 'success'
                              ? 'green'
                              : b.paymentStatus === 'pending'
                              ? 'yellow'
                              : 'red'
                          }
                          size="sm"
                          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {b.paymentStatus.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        {b.isCheckedIn ? (
                          <Badge color="green" variant="light" size="sm" leftSection={<IconScan size={12} />}>
                            CHECKED IN
                          </Badge>
                        ) : (
                          <Badge color="gray" variant="light" size="sm">
                            PENDING
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Text size="xs" c="gray.4">
                          {b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          {/* Edit Details Action Button */}
                          <Tooltip label="Edit Stall Booking & Member Details">
                            <ActionIcon
                              variant="light"
                              color="yellow"
                              size="sm"
                              radius="md"
                              onClick={() => handleOpenEditModal(b)}
                            >
                              <IconEdit size={15} />
                            </ActionIcon>
                          </Tooltip>

                          {/* Open Pass in New Tab if generated */}
                          {hasLink ? (
                            <Tooltip label="Open Live Stall Pass (New Tab)">
                              <ActionIcon
                                component="a"
                                href={`/dandiyaraas/stall/pass/${b.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="cyan"
                                variant="light"
                                size="sm"
                                radius="md"
                              >
                                <IconExternalLink size={15} />
                              </ActionIcon>
                            </Tooltip>
                          ) : (
                            <Tooltip
                              label={
                                b.paymentStatus === 'success'
                                  ? 'Generate Digital Pass & QR Link'
                                  : 'Payment pending — confirm payment first to generate pass link'
                              }
                            >
                              <ActionIcon
                                color="cyan"
                                variant="outline"
                                size="sm"
                                radius="md"
                                disabled={b.paymentStatus !== 'success'}
                                loading={generatingLinkForId === b.id}
                                onClick={() => b.paymentStatus === 'success' && handleGenerateLinkForBooking(b.id)}
                              >
                                <IconLink size={15} />
                              </ActionIcon>
                            </Tooltip>
                          )}

                          <Tooltip label="Send Details on WhatsApp">
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              radius="md"
                              onClick={() => sendWhatsAppMessage(b)}
                            >
                              <IconBrandWhatsapp size={15} />
                            </ActionIcon>
                          </Tooltip>

                          {hasLink && (
                            <Tooltip label="Resend Confirmation SMS">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                radius="md"
                                loading={resendingSmsId === b.id}
                                onClick={() => handleResendSms(b)}
                              >
                                <IconMessage size={15} />
                              </ActionIcon>
                            </Tooltip>
                          )}

                          {b.paymentStatus !== 'success' && (
                            isStallAlreadyConfirmed(b) ? (
                              <Tooltip label={`Stall #${b.stallNumber} is already confirmed and booked by another exhibitor. Duplicate payment cannot be confirmed.`}>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  size="sm"
                                  radius="md"
                                  disabled
                                  style={{ cursor: 'not-allowed', opacity: 0.35 }}
                                >
                                  <IconCheck size={15} />
                                </ActionIcon>
                              </Tooltip>
                            ) : (
                              <Tooltip label="Mark Payment Confirmed & Issue Stall Pass">
                                <ActionIcon
                                  variant="filled"
                                  color="green"
                                  size="sm"
                                  radius="md"
                                  loading={confirmingStallId === b.id}
                                  onClick={() => handleConfirmStallPayment(b)}
                                >
                                  <IconCheck size={15} />
                                </ActionIcon>
                              </Tooltip>
                            )
                          )}

                          <Button
                            size="xs"
                            variant="light"
                            color="royalGold"
                            onClick={() => handleViewBooking(b)}
                            leftSection={<IconEye size={13} />}
                          >
                            Inspect
                          </Button>

                          <Tooltip label="Delete Booking & Free Stall">
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              radius="md"
                              onClick={() => handlePromptDelete(b)}
                            >
                              <IconTrash size={15} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* =======================================================================
          MODAL: DIRECT STALL BOOKING ISSUANCE (ADMIN DIRECT ISSUE)
          ======================================================================= */}
      <Modal
        opened={createModalOpened}
        onClose={() => !creatingStallBooking && setCreateModalOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon color="yellow" variant="light" size="md" radius="md">
              <IconBuildingStore size={18} />
            </ThemeIcon>
            <Text fw={700} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Issue Direct Stall Booking
            </Text>
          </Group>
        }
        size="lg"
        centered
        radius="xl"
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.35)' },
          header: { backgroundColor: '#140305', borderBottom: '1px solid rgba(234, 179, 8, 0.2)' },
        }}
      >
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
            Directly register and confirm a stall allotment. You can specify all details including brand name, contact person, payment mode, and team member passes. Digital booking link generation is <strong>optional (turned off by default)</strong>.
          </Alert>

          {/* Section 1: Stall & Contact Details */}
          <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
            <Text size="xs" fw={700} c="royalGold.4" mb="xs" style={{ letterSpacing: '0.05em' }}>
              1. STALL SELECTION &amp; EXHIBITOR INFO
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <Select
                label="Select Stall Booth"
                placeholder="Choose stall"
                required
                data={stallsList.map((s) => ({
                  value: s.stallNumber,
                  label: `Stall ${s.stallNumber} - ₹${s.price?.toLocaleString('en-IN')} (${
                    s.isBooked ? 'Already Reserved' : 'Available'
                  })`,
                }))}
                value={newStallNumber}
                onChange={(val) => val && handleSelectStallForNewBooking(val)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Brand / Business Name"
                placeholder="e.g. Royal Sweets & Snacks"
                required
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Contact Person Full Name"
                placeholder="e.g. Rajesh Kumar"
                required
                value={newBookerName}
                onChange={(e) => setNewBookerName(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="10-Digit Mobile Number"
                placeholder="e.g. 9876543210"
                required
                maxLength={10}
                leftSection={<Text size="xs" c="gray.4">+91</Text>}
                value={newMobile}
                onChange={(e) => setNewMobile(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Email Address (Optional)"
                placeholder="e.g. contact@business.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Stall Category / Products"
                placeholder="e.g. Food Stall, Garments, Jewellery"
                value={newStallType}
                onChange={(e) => setNewStallType(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />
            </SimpleGrid>
          </Paper>

          {/* Section 2: Pricing & Payment Method */}
          <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
            <Text size="xs" fw={700} c="royalGold.4" mb="xs" style={{ letterSpacing: '0.05em' }}>
              2. PRICING &amp; PAYMENT DETAILS
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <NumberInput
                label="Allotment Amount (₹)"
                description="Editable for special rate or ₹0 (sponsor)"
                min={0}
                value={newAmount}
                onChange={setNewAmount}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
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
                value={newPaymentMethod}
                onChange={(v) => setNewPaymentMethod(v || 'Cash')}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <Select
                label="Payment Status"
                data={[
                  { value: 'success', label: 'Paid & Confirmed' },
                  { value: 'pending', label: 'Pending Payment' },
                ]}
                value={newPaymentStatus}
                onChange={(v) => setNewPaymentStatus(v || 'success')}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />
            </SimpleGrid>
          </Paper>

          {/* Section 3: Exhibitor Passes & Team Members */}
          <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
            <Group justify="space-between" mb="xs">
              <Box>
                <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.05em' }}>
                  3. EXHIBITOR TEAM MEMBER PASSES
                </Text>
                <Text size="11px" c="gray.4">
                  2 official exhibitor passes are included with this allotment. You can add or modify member names attending the stall.
                </Text>
              </Box>
              <Button
                size="xs"
                variant="light"
                color="yellow"
                leftSection={<IconPlus size={14} />}
                onClick={handleAddNewTeamMember}
              >
                Add Member
              </Button>
            </Group>

            <Stack gap="xs" mt="xs">
              {newTeamMembers.map((member, idx) => (
                <Group key={idx} gap="xs" wrap="nowrap">
                  <TextInput
                    placeholder={`Team Member #${idx + 1} Full Name (e.g. Ramesh Sharma)`}
                    value={member}
                    onChange={(e) => handleNewTeamMemberChange(idx, e.currentTarget.value)}
                    style={{ flex: 1 }}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                    }}
                  />
                  {newTeamMembers.length > 1 && (
                    <Tooltip label="Remove Member">
                      <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveNewTeamMember(idx)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              ))}
            </Stack>
          </Paper>

          {/* Section 4: Optional Booking Link & Digital Pass Generation */}
          <Paper
            p="sm"
            radius="md"
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.05)',
              border: '1px dashed rgba(234, 179, 8, 0.35)',
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Box style={{ flex: 1 }}>
                  <Text size="xs" fw={700} c="yellow.3">
                    Generate Public Booking Link &amp; Digital QR Pass
                  </Text>
                  <Text size="11px" c="gray.4">
                    Optional (turned <strong>OFF by default</strong>). If left OFF, this stall is booked offline without creating a digital pass URL. Turn ON to generate a live QR pass, link, and exhibitor card.
                  </Text>
                </Box>
                <Switch
                  checked={newPaymentStatus === 'success' && newGenerateBookingLink}
                  disabled={newPaymentStatus !== 'success'}
                  onChange={(e) => setNewGenerateBookingLink(e.currentTarget.checked)}
                  color="yellow"
                  size="md"
                />
              </Group>

              {newPaymentStatus !== 'success' && (
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

              {newPaymentStatus === 'success' && newGenerateBookingLink && (
                <>
                  <Divider my={4} color="rgba(234, 179, 8, 0.2)" />
                  <Group justify="space-between" align="center">
                    <Box style={{ flex: 1 }}>
                      <Text size="xs" fw={600} c="white">
                        Dispatch Confirmation SMS to Exhibitor
                      </Text>
                      <Text size="11px" c="gray.4">
                        Send automated SMS via TextBee to +91 {newMobile || 'exhibitor'} with pass details.
                      </Text>
                    </Box>
                    <Switch
                      checked={newSendSms}
                      onChange={(e) => setNewSendSms(e.currentTarget.checked)}
                      color="green"
                      size="sm"
                    />
                  </Group>
                </>
              )}
            </Stack>
          </Paper>

          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => setCreateModalOpened(false)}>
              Cancel
            </Button>
            <Button
              className="btn-auspicious-gold"
              loading={creatingStallBooking}
              onClick={handleCreateStallBookingSubmit}
              leftSection={<IconBuildingStore size={18} />}
            >
              Issue Stall Booking
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* =======================================================================
          MODAL: ISSUANCE SUCCESS CONFIRMATION
          ======================================================================= */}
      <Modal
        opened={successModalOpened}
        onClose={() => setSuccessModalOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon color="green" variant="light" size="md" radius="md">
              <IconCheck size={18} />
            </ThemeIcon>
            <Text fw={700} c="green.4" style={{ fontFamily: "'Cinzel', serif" }}>
              Stall Booking Confirmed!
            </Text>
          </Group>
        }
        size="md"
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(74, 222, 128, 0.4)' },
          header: { backgroundColor: '#140305', borderBottom: '1px solid rgba(74, 222, 128, 0.2)' },
        }}
      >
        {issuedBookingResult && (
          <Stack gap="md" pt="xs">
            <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
              <SimpleGrid cols={2} spacing="xs">
                <Box>
                  <Text size="xs" c="dimmed">Booking Number:</Text>
                  <Text size="sm" fw={800} c="royalGold.3">{issuedBookingResult.bookingNumber}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Allotted Stall:</Text>
                  <Text size="sm" fw={800} c="white">Stall #{issuedBookingResult.stallNumber}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Brand Name:</Text>
                  <Text size="sm" fw={700} c="white">{issuedBookingResult.brandName}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Contact Person:</Text>
                  <Text size="xs" c="gray.3">{issuedBookingResult.bookerName} (+91 {issuedBookingResult.mobile})</Text>
                </Box>
              </SimpleGrid>
            </Paper>

            {issuedBookingResult.qrCodeDataUrl ? (
              <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(6, 44, 20, 0.6)', border: '1px solid #22c55e' }}>
                <Text size="xs" fw={700} c="#4ade80" mb={4}>
                  ✓ Digital Pass &amp; Booking Link Active
                </Text>
                <Text size="xs" c="gray.3" mb="xs">
                  Pass Link: {typeof window !== 'undefined' ? `${window.location.origin}/dandiyaraas/stall/pass/${issuedBookingResult.id}` : ''}
                </Text>
                <Group gap="xs" wrap="wrap">
                  <Button
                    size="xs"
                    color="green"
                    variant="light"
                    leftSection={<IconCopy size={14} />}
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/dandiyaraas/stall/pass/${issuedBookingResult.id}`,
                        'Digital Pass Link Copied'
                      )
                    }
                  >
                    Copy Pass URL
                  </Button>
                  <Button
                    size="xs"
                    color="cyan"
                    variant="light"
                    component="a"
                    href={`/dandiyaraas/stall/pass/${issuedBookingResult.id}`}
                    target="_blank"
                    leftSection={<IconExternalLink size={14} />}
                  >
                    Open Live Pass
                  </Button>
                </Group>
              </Paper>
            ) : (
              <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px dashed rgba(234, 179, 8, 0.35)' }}>
                <Text size="xs" fw={700} c="yellow.3" mb={2}>
                  Offline Allotment Recorded (No Pass Link Generated)
                </Text>
                <Text size="xs" c="gray.4">
                  The stall is reserved in the system. As requested, no digital pass URL was created. You can generate one anytime from the booking table or by clicking &quot;Edit Details&quot;.
                </Text>
              </Paper>
            )}

            <Button
              className="btn-auspicious-gold"
              fullWidth
              onClick={() => setSuccessModalOpened(false)}
            >
              Done
            </Button>
          </Stack>
        )}
      </Modal>

      {/* =======================================================================
          MODAL: EDIT STALL BOOKING & TEAM MEMBER DETAILS
          ======================================================================= */}
      <Modal
        opened={editModalOpened}
        onClose={() => !savingEdit && setEditModalOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon color="yellow" variant="light" size="md" radius="md">
              <IconEdit size={18} />
            </ThemeIcon>
            <Text fw={700} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Edit Stall Booking: {editBookingNumber}
            </Text>
          </Group>
        }
        size="lg"
        centered
        radius="xl"
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.35)' },
          header: { backgroundColor: '#140305', borderBottom: '1px solid rgba(234, 179, 8, 0.2)' },
        }}
      >
        <Stack gap="md" pt="xs">
          {isStallAlreadyConfirmed({ id: editBookingId, stallNumber: editStallNumber }) && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="orange"
              variant="light"
              radius="md"
              title="Duplicate Stall Warning"
              styles={{
                root: { backgroundColor: 'rgba(234, 88, 12, 0.12)', border: '1px solid rgba(234, 88, 12, 0.35)' },
                message: { color: '#fed7aa', fontSize: '0.85rem' },
                title: { color: '#fb923c', fontWeight: 700 },
              }}
            >
              Stall #{editStallNumber} is already confirmed and occupied by another booking. This pending payment record cannot be marked as Paid &amp; Confirmed because a stall cannot have two bookers.
            </Alert>
          )}

          {/* Section 1: Booker & Brand Info */}
          <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
            <Text size="xs" fw={700} c="royalGold.4" mb="xs" style={{ letterSpacing: '0.05em' }}>
              1. EXHIBITOR &amp; STALL INFO
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Allotted Stall Number"
                placeholder="e.g. 1, 5, A, K"
                required
                value={editStallNumber}
                onChange={(e) => setEditStallNumber(e.currentTarget.value.toUpperCase())}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Brand / Business Name"
                placeholder="Business name"
                required
                value={editBrandName}
                onChange={(e) => setEditBrandName(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Contact Person Name"
                placeholder="Contact person"
                required
                value={editBookerName}
                onChange={(e) => setEditBookerName(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="10-Digit Mobile Number"
                placeholder="Mobile number"
                required
                maxLength={10}
                leftSection={<Text size="xs" c="gray.4">+91</Text>}
                value={editMobile}
                onChange={(e) => setEditMobile(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Email Address"
                placeholder="Email address"
                value={editEmail}
                onChange={(e) => setEditEmail(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <TextInput
                label="Category / Products"
                placeholder="Category"
                value={editStallType}
                onChange={(e) => setEditStallType(e.currentTarget.value)}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />
            </SimpleGrid>
          </Paper>

          {/* Section 2: Pricing & Payment */}
          <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
            <Text size="xs" fw={700} c="royalGold.4" mb="xs" style={{ letterSpacing: '0.05em' }}>
              2. FINANCIAL &amp; PAYMENT STATUS
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <NumberInput
                label="Total Amount (₹)"
                min={0}
                value={editAmount}
                onChange={setEditAmount}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />

              <Select
                label="Payment Status"
                data={[
                  { value: 'success', label: 'Paid & Confirmed (Success)' },
                  { value: 'pending', label: 'Pending Payment' },
                  { value: 'failed', label: 'Failed' },
                ]}
                value={editPaymentStatus}
                onChange={(v) => setEditPaymentStatus(v || 'success')}
                styles={{
                  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                  label: { color: '#fde047', fontWeight: 600, fontSize: '0.85rem' },
                }}
              />
            </SimpleGrid>
          </Paper>

          {/* Section 3: Allotted Team Member Names */}
          <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
            <Group justify="space-between" mb="xs">
              <Box>
                <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.05em' }}>
                  3. ALLOTTED TEAM MEMBERS ({editTeamMembers.length} ACTIVE)
                </Text>
                <Text size="11px" c="gray.4">
                  Names of all authorized attendees for this booth. Modify existing or add new team passes.
                </Text>
              </Box>
              <Button
                size="xs"
                variant="light"
                color="yellow"
                leftSection={<IconPlus size={14} />}
                onClick={handleAddEditTeamMember}
              >
                Add Member
              </Button>
            </Group>

            <Stack gap="xs" mt="xs">
              {editTeamMembers.map((member, idx) => (
                <Group key={idx} gap="xs" wrap="nowrap">
                  <TextInput
                    placeholder={`Team Member #${idx + 1} Full Name`}
                    value={member}
                    onChange={(e) => handleEditTeamMemberChange(idx, e.currentTarget.value)}
                    style={{ flex: 1 }}
                    styles={{
                      input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(234, 179, 8, 0.25)' },
                    }}
                  />
                  {editTeamMembers.length > 1 && (
                    <Tooltip label="Remove Member">
                      <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveEditTeamMember(idx)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              ))}
            </Stack>
          </Paper>

          {/* Section 4: Digital Booking Link Management */}
          <Paper
            p="sm"
            radius="md"
            style={{
              backgroundColor: editQrCodeDataUrl ? 'rgba(6, 44, 20, 0.5)' : 'rgba(234, 179, 8, 0.06)',
              border: editQrCodeDataUrl ? '1px solid #22c55e' : '1px dashed rgba(234, 179, 8, 0.35)',
            }}
          >
            {editQrCodeDataUrl ? (
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Box>
                    <Text size="xs" fw={700} c="#4ade80">
                      ✓ Digital Pass Link Active
                    </Text>
                    <Text size="11px" c="gray.3">
                      Public Pass URL: {typeof window !== 'undefined' ? `${window.location.origin}/dandiyaraas/stall/pass/${editBookingId}` : ''}
                    </Text>
                  </Box>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      color="green"
                      variant="light"
                      leftSection={<IconCopy size={14} />}
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/dandiyaraas/stall/pass/${editBookingId}`,
                          'Pass Link Copied'
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
                      href={`/dandiyaraas/stall/pass/${editBookingId}`}
                      target="_blank"
                      leftSection={<IconExternalLink size={14} />}
                    >
                      Open
                    </Button>
                  </Group>
                </Group>
              </Stack>
            ) : (
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" fw={700} c="yellow.3">
                      Digital Pass Link Not Generated (Offline Allotment)
                    </Text>
                    <Text size="11px" c="gray.4">
                      {editPaymentStatus === 'success'
                        ? 'This booking has no active digital QR pass. Click below to generate the public pass link and QR code immediately.'
                        : 'Payment is marked as Pending. Confirm payment before generating a digital pass link.'}
                    </Text>
                  </Box>
                  <Button
                    size="xs"
                    color="yellow"
                    variant="filled"
                    disabled={editPaymentStatus !== 'success'}
                    loading={generatingLinkForId === editBookingId}
                    leftSection={<IconLink size={14} />}
                    onClick={() => handleGenerateLinkForBooking(editBookingId)}
                  >
                    Generate Pass Link Now
                  </Button>
                </Group>
                {editPaymentStatus !== 'success' && (
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
                    Payment is pending. Please update payment status to &quot;Paid &amp; Confirmed&quot; first to enable digital pass link generation.
                  </Alert>
                )}
              </Stack>
            )}
          </Paper>

          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" onClick={() => setEditModalOpened(false)}>
              Cancel
            </Button>
            <Button
              className="btn-auspicious-gold"
              loading={savingEdit}
              onClick={() => handleSaveEditBooking(false)}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* =======================================================================
          MODAL: BOOKING DETAILS & PASS PREVIEW
          ======================================================================= */}
      <Modal
        opened={opened}
        onClose={close}
        size="1100px"
        title={
          selectedBooking && (
            <Group gap="xs">
              <Text fw={800} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
                Booking Details: {selectedBooking.bookingNumber}
              </Text>
              <Badge
                color={selectedBooking.paymentStatus === 'success' ? 'green' : 'yellow'}
              >
                {selectedBooking.paymentStatus.toUpperCase()}
              </Badge>
              {selectedBooking.isCheckedIn && (
                <Badge color="green" variant="filled" size="sm">
                  ENTRY VERIFIED
                </Badge>
              )}
            </Group>
          )
        }
        styles={{
          content: {
            backgroundColor: '#140305',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          },
          header: {
            backgroundColor: '#140305',
            borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
          },
        }}
      >
        {selectedBooking && (
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" style={{ alignItems: 'start' }}>
              {/* Left Column: Official Exhibitor Pass Card */}
              <Box style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <ExhibitorPassCard booking={selectedBooking} showDownloadButton={Boolean(selectedBooking.qrCodeDataUrl)} />
              </Box>

              {/* Right Column: Transaction & Verification Details */}
              <Stack gap="md">
                <Paper
                  p="md"
                  radius="lg"
                  style={{
                    backgroundColor: 'rgba(36, 8, 14, 0.8)',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                  }}
                >
                  <Group justify="space-between" mb="sm">
                    <Text size="xs" fw={700} c="royalGold.4">
                      RESERVATION METRICS
                    </Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="yellow"
                      leftSection={<IconEdit size={14} />}
                      onClick={() => {
                        close();
                        handleOpenEditModal(selectedBooking);
                      }}
                    >
                      Edit All Details
                    </Button>
                  </Group>

                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Reserved Stall:</Text>
                      <Text size="sm" fw={800} c="yellow.3">Stall {selectedBooking.stallNumber}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Brand / Business:</Text>
                      <Text size="sm" fw={700} c="white">{selectedBooking.brandName}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Contact Person:</Text>
                      <Text size="sm" c="gray.2">{selectedBooking.bookerName}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Mobile Number:</Text>
                      <Text size="sm" c="gray.2">+91 {selectedBooking.mobile}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Email Address:</Text>
                      <Text size="xs" c="gray.3">{selectedBooking.email || 'N/A'}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Category / Products:</Text>
                      <Text size="xs" c="gray.3">{selectedBooking.stallType}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Allotted Team Members:</Text>
                      <Text size="xs" fw={600} c="yellow.2">{selectedBooking.teamMembers}</Text>
                    </Group>
                    {selectedBooking.extraMembersCount > 0 && (
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Extra Members Added:</Text>
                        <Text size="xs" fw={700} c="yellow.3">
                          {selectedBooking.extraMembersCount} extra member{selectedBooking.extraMembersCount === 1 ? '' : 's'} (+₹{selectedBooking.extraMembersAmount?.toLocaleString('en-IN')})
                        </Text>
                      </Group>
                    )}
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Total Amount:</Text>
                      <Text size="sm" fw={800} c="white">
                        ₹{(selectedBooking.totalAmount || selectedBooking.amount)?.toLocaleString('en-IN')}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Payment ID:</Text>
                      <Text size="xs" c="yellow.3" fw={700}>{selectedBooking.razorpayPaymentId || 'N/A'}</Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Digital Pass Link Box */}
                {selectedBooking.qrCodeDataUrl ? (
                  <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(6, 44, 20, 0.6)', border: '1px solid #22c55e' }}>
                    <Text size="xs" fw={700} c="#4ade80" mb={2}>
                      ✓ Digital QR Pass Active
                    </Text>
                    <Group gap="xs" mt="xs">
                      <Button
                        size="xs"
                        color="green"
                        variant="light"
                        leftSection={<IconCopy size={14} />}
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/dandiyaraas/stall/pass/${selectedBooking.id}`,
                            'Pass URL Copied'
                          )
                        }
                      >
                        Copy Pass Link
                      </Button>
                      <Button
                        size="xs"
                        color="cyan"
                        variant="light"
                        component="a"
                        href={`/dandiyaraas/stall/pass/${selectedBooking.id}`}
                        target="_blank"
                        leftSection={<IconExternalLink size={14} />}
                      >
                        Open Live Pass
                      </Button>
                    </Group>
                  </Paper>
                ) : (
                  <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px dashed rgba(234, 179, 8, 0.35)' }}>
                    <Text size="xs" fw={700} c="yellow.3" mb={2}>
                      Offline Allotment (Digital Pass Not Generated)
                    </Text>
                    <Text size="xs" c="gray.4" mb="xs">
                      This stall was booked offline without creating a public pass URL or QR code.
                    </Text>
                    <Button
                      size="xs"
                      color="yellow"
                      variant="filled"
                      loading={generatingLinkForId === selectedBooking.id}
                      leftSection={<IconLink size={14} />}
                      onClick={() => handleGenerateLinkForBooking(selectedBooking.id)}
                    >
                      Generate Digital Pass Link Now
                    </Button>
                  </Paper>
                )}

                {/* Gate Entry Check-in Status Box */}
                <Paper
                  p="md"
                  radius="lg"
                  style={{
                    backgroundColor: selectedBooking.isCheckedIn ? 'rgba(6, 44, 20, 0.6)' : 'rgba(234, 179, 8, 0.08)',
                    border: selectedBooking.isCheckedIn ? '1px solid #22c55e' : '1px solid rgba(234, 179, 8, 0.25)',
                  }}
                >
                  <Text size="xs" fw={700} c={selectedBooking.isCheckedIn ? '#4ade80' : 'royalGold.4'} mb="xs">
                    GATE ENTRY STATUS
                  </Text>
                  {selectedBooking.isCheckedIn ? (
                    <Stack gap={2}>
                      <Text size="sm" fw={700} c="green.2">
                        ✓ Checked In at Venue
                      </Text>
                      <Text size="xs" c="gray.3">
                        Time: {selectedBooking.checkedInAt ? new Date(selectedBooking.checkedInAt).toLocaleString('en-IN') : 'N/A'}
                      </Text>
                      <Text size="xs" c="gray.4">
                        Verified By: {selectedBooking.checkedInBy || 'Gate Verifier'}
                      </Text>
                    </Stack>
                  ) : (
                    <Text size="xs" c="gray.4">
                      Pass has not been scanned at the entry gate yet.
                    </Text>
                  )}
                </Paper>

                {/* Confirm Payment Action if pending */}
                {selectedBooking.paymentStatus !== 'success' && (
                  <Button
                    color="green"
                    variant="filled"
                    size="md"
                    fullWidth
                    leftSection={<IconCheck size={20} />}
                    loading={confirmingStallId === selectedBooking.id}
                    onClick={() => handleConfirmStallPayment(selectedBooking)}
                  >
                    Confirm Payment &amp; Issue Official Stall Pass
                  </Button>
                )}

                {/* WhatsApp Notification Action */}
                <Button
                  color="green"
                  variant="filled"
                  size="md"
                  fullWidth
                  leftSection={<IconBrandWhatsapp size={20} />}
                  onClick={() => sendWhatsAppMessage(selectedBooking)}
                >
                  Send Details on WhatsApp
                </Button>

                {/* Resend Confirmation SMS Action */}
                {selectedBooking.qrCodeDataUrl && (
                  <Button
                    color="blue"
                    variant="light"
                    size="md"
                    fullWidth
                    leftSection={<IconMessage size={20} />}
                    loading={resendingSmsId === selectedBooking.id}
                    onClick={() => handleResendSms(selectedBooking)}
                  >
                    Resend Confirmation SMS (TextBee)
                  </Button>
                )}
              </Stack>
            </SimpleGrid>

            <Group justify="space-between" mt="sm">
              <Button
                variant="light"
                color="yellow"
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  close();
                  handleOpenEditModal(selectedBooking);
                }}
              >
                Edit All Details &amp; Team Members
              </Button>
              <Button variant="default" onClick={close}>
                Close Details
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* =======================================================================
          MODAL: DELETE ORDER CONFIRMATION
          ======================================================================= */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={
          <Text fw={700} size="md" c="red.4">
            Delete Stall Booking Confirmation
          </Text>
        }
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(239, 68, 68, 0.4)' },
          header: { backgroundColor: '#140305' },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="gray.3">
            Are you sure you want to delete Stall Booking <b style={{ color: '#facc15' }}>{bookingToDelete?.bookingNumber}</b> for{' '}
            <b style={{ color: 'white' }}>Stall {bookingToDelete?.stallNumber}</b> ({bookingToDelete?.brandName || bookingToDelete?.bookerName})?
          </Text>
          <Text size="xs" c="gray.4">
            This will permanently remove the booking record and immediately restore <b>Stall {bookingToDelete?.stallNumber}</b> as available for booking.
          </Text>

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" color="gray" onClick={closeDelete}>
              Cancel
            </Button>
            <Button color="red" variant="filled" loading={deleting} onClick={handleConfirmDelete}>
              Delete &amp; Free Stall
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

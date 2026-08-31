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
  Select,
  Modal,
  Loader,
  SimpleGrid,
  ActionIcon,
  Tooltip,
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
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { ExhibitorPassCard } from '@/components/ExhibitorPassCard';
import { openWhatsAppChat } from '@/lib/whatsapp';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>('all');
  const [filterEntryStatus, setFilterEntryStatus] = useState<string | null>('all');
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Delete Order Confirmation State
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [bookingToDelete, setBookingToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sendWhatsAppMessage = (b: any) => {
    const passUrl = typeof window !== 'undefined' ? `${window.location.origin}/dandiyaraas/stall/success?bookingId=${b.id}` : '';
    
    const msg =
      `*NAMASTE ${b.brandName ? b.brandName.toUpperCase() : b.bookerName.toUpperCase()}!*\n\n` +
      `Thank you for being an integral part of Asha Bani Dandiya Raas 6.0.\n\n` +
      `Your stall reservation has been confirmed as an official stall exhibitor:\n` +
      `- *Stall:* Stall ${b.stallNumber}\n` +
      `- *Booking ID:* ${b.bookingNumber}\n` +
      `- *Date:* Tuesday, 13 October 2026\n` +
      `- *Venue:* Maharaja Agrasen Bhavan, Aggarwal Dharamshala, Saharanpur\n` +
      `- *Stall Setup Time:* 4:00 PM\n` +
      `- *Event Hours:* 6:00 PM to 12:00 AM\n` +
      `- *Passes Included:* 2 Official Exhibitor Passes (${b.teamMembers || b.bookerName})\n\n` +
      `*Official Digital Pass Link:*\n${passUrl}\n\n` +
      `Please show this pass at the gate for scanning and entry into the venue.\n\n` +
      `*Helpline:* +91 6399063455`;

    openWhatsAppChat(b.mobile || '', msg);

    notifications.show({
      title: 'WhatsApp Opened',
      message: `Message dispatched for ${b.bookerName}.`,
      color: 'green',
    });
  };

  const handlePromptDelete = (b: any) => {
    setBookingToDelete(b);
    openDelete();
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete stall booking');
      }

      notifications.show({
        title: 'Booking Deleted',
        message: `Stall booking ${bookingToDelete.bookingNumber} deleted and Stall ${bookingToDelete.stallNumber} is now available!`,
        color: 'green',
      });

      closeDelete();
      setBookingToDelete(null);
      fetchBookings();
    } catch (err: any) {
      notifications.show({ title: 'Delete Failed', message: err.message, color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const query = search.toLowerCase();
    const matchesQuery =
      b.bookingNumber?.toLowerCase().includes(query) ||
      b.stallNumber?.toLowerCase().includes(query) ||
      b.brandName?.toLowerCase().includes(query) ||
      b.bookerName?.toLowerCase().includes(query) ||
      b.mobile?.toLowerCase().includes(query) ||
      b.email?.toLowerCase().includes(query);

    const matchesStatus =
      filterStatus === 'all' || !filterStatus || b.paymentStatus === filterStatus;

    const matchesEntry =
      filterEntryStatus === 'all' ||
      !filterEntryStatus ||
      (filterEntryStatus === 'entered' && b.isCheckedIn) ||
      (filterEntryStatus === 'unentered' && !b.isCheckedIn);

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
    <Container size="xl" py="md">
      <Group justify="space-between" align="center" mb="lg" gap="md">
        <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
            Stall Bookings &amp; Transactions
          </Title>
          <Text size="sm" c="gray.4">
            Complete registry of exhibitor registrations, payment transaction IDs, and digital passes.
          </Text>
        </Box>

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
            <Loader color="royalGold" size="md" />
            <Text size="sm" c="gray.4">
              Loading bookings data...
            </Text>
          </Stack>
        ) : filteredBookings.length === 0 ? (
          <Stack align="center" py={50}>
            <IconReceipt size={48} color="#854d0e" />
            <Text fw={600} c="gray.4">
              No stall bookings found matching your search.
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={950}>
            <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 950 }}>
              <Table.Thead>
                <Table.Tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Booking Ref</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Stall</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Brand / Business</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Booker Contact</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Amount</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Payment</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Entry Status</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Date &amp; Time</Table.Th>
                  <Table.Th style={{ color: '#facc15', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredBookings.map((b) => (
                  <Table.Tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="xs" fw={700} c="yellow.3">
                        {b.bookingNumber}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Badge color="yellow" variant="filled" size="sm" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        Stall {b.stallNumber}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={700} c="white">
                        {b.brandName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {b.stallType}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.2">
                        {b.bookerName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {b.mobile} • {b.email}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="sm" fw={800} c="white">
                        ₹{b.amount?.toLocaleString('en-IN')}
                      </Text>
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
                        <Badge color="green" variant="light" size="sm" leftSection={<IconScan size={12} />} style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                          CHECKED IN
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="light" size="sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
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

                        <Tooltip label="Send Pass on WhatsApp">
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={() => sendWhatsAppMessage(b)}
                          >
                            <IconBrandWhatsapp size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Button
                          size="xs"
                          variant="light"
                          color="royalGold"
                          onClick={() => handleViewBooking(b)}
                          leftSection={<IconEye size={14} />}
                        >
                          Inspect
                        </Button>
                        <Tooltip label="Delete Booking & Free Stall">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handlePromptDelete(b)}
                          >
                            <IconTrash size={16} />
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

      {/* Booking Details & Pass Modal */}
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
              {/* Left Column: Official Exhibitor Pass Card identical to user's view */}
              <Box style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <ExhibitorPassCard booking={selectedBooking} showDownloadButton={true} />
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
                  <Text size="xs" fw={700} c="royalGold.4" mb="sm">
                    RESERVATION METRICS
                  </Text>

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
                      <Text size="xs" c="gray.3">{selectedBooking.email}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Category / Products:</Text>
                      <Text size="xs" c="gray.3">{selectedBooking.stallType}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Allotted Team Members:</Text>
                      <Text size="xs" fw={600} c="yellow.2">{selectedBooking.teamMembers}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Payment ID:</Text>
                      <Text size="xs" c="yellow.3" fw={700}>{selectedBooking.razorpayPaymentId || 'N/A'}</Text>
                    </Group>
                  </Stack>
                </Paper>

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

                {/* WhatsApp Notification Action */}
                <Button
                  color="green"
                  variant="filled"
                  size="md"
                  fullWidth
                  leftSection={<IconBrandWhatsapp size={20} />}
                  onClick={() => sendWhatsAppMessage(selectedBooking)}
                >
                  Send Confirmation &amp; Pass on WhatsApp
                </Button>
              </Stack>
            </SimpleGrid>

            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={close}>
                Close Details
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete Stall Order Confirmation Modal */}
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

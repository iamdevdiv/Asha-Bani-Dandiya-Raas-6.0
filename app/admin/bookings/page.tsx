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
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { ExhibitorPassCard } from '@/components/ExhibitorPassCard';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>('all');
  const [filterEntryStatus, setFilterEntryStatus] = useState<string | null>('all');
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const sendWhatsAppMessage = (b: any) => {
    const cleanMobile = (b.mobile || '').replace(/\D/g, '').slice(-10);
    const passUrl = typeof window !== 'undefined' ? `${window.location.origin}/dandiyaraas/stall/success?bookingId=${b.id}` : '';
    
    const msg = `Dear ${b.brandName || b.bookerName},

Thank you for being an integral part of Asha Bani Dandiya Raas 6.0!

Your stall reservation has been confirmed as an official stall exhibitor:
• Stall: Stall ${b.stallNumber}
• Booking ID: ${b.bookingNumber}
• Date: Tuesday, 13 October 2026
• Venue: Maharaja Agrasen Bhavan, Aggarwal Dharamshala, Saharanpur
• Stall Setup Time: 4:00 PM
• Event Hours: 6:00 PM - 12:00 AM
• Passes Included: 2 Official Exhibitor Passes (${b.teamMembers || b.bookerName})

Official Digital Pass Link:
${passUrl}

Please show this pass at the gate for scanning and entry into the venue.

Helpline: +91 6399063455`;

    const url = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    notifications.show({
      title: 'WhatsApp Opened',
      message: `Message created for +91 ${cleanMobile}. You can also attach the downloaded pass image.`,
      color: 'green',
    });
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
      <Group justify="space-between" align="center" mb="lg" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
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
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <Table.Th style={{ color: '#facc15' }}>Booking Ref</Table.Th>
                <Table.Th style={{ color: '#facc15' }}>Stall</Table.Th>
                <Table.Th style={{ color: '#facc15' }}>Brand / Business</Table.Th>
                <Table.Th style={{ color: '#facc15' }}>Booker Contact</Table.Th>
                <Table.Th style={{ color: '#facc15' }}>Amount</Table.Th>
                <Table.Th style={{ color: '#facc15' }}>Payment</Table.Th>
                <Table.Th style={{ color: '#facc15' }}>Entry Status</Table.Th>
                <Table.Th style={{ color: '#facc15' }}>Date &amp; Time</Table.Th>
                <Table.Th style={{ color: '#facc15', textAlign: 'right' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredBookings.map((b) => (
                <Table.Tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Table.Td>
                    <Text size="xs" fw={700} c="yellow.3">
                      {b.bookingNumber}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="royalGold" variant="filled" size="sm">
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
                  <Table.Td>
                    <Text size="sm" fw={800} c="white">
                      ₹{b.amount?.toLocaleString('en-IN')}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={
                        b.paymentStatus === 'success'
                          ? 'green'
                          : b.paymentStatus === 'pending'
                          ? 'yellow'
                          : 'red'
                      }
                      size="sm"
                    >
                      {b.paymentStatus.toUpperCase()}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
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
                  <Table.Td>
                    <Text size="xs" c="gray.4">
                      {b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : 'N/A'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        variant="light"
                        color="green"
                        onClick={() => sendWhatsAppMessage(b)}
                        title="Send Official Pass on WhatsApp"
                      >
                        <IconBrandWhatsapp size={16} />
                      </ActionIcon>
                      <Button
                        size="xs"
                        variant="light"
                        color="royalGold"
                        onClick={() => handleViewBooking(b)}
                        leftSection={<IconEye size={14} />}
                      >
                        Inspect
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
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
    </Container>
  );
}

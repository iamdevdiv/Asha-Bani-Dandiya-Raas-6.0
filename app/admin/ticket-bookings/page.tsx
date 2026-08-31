'use client';

import React, { useEffect, useState } from 'react';
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
  Table,
  Badge,
  TextInput,
  Select,
  SimpleGrid,
  Card,
  ThemeIcon,
  Modal,
  ActionIcon,
  NumberInput,
  Tooltip,
  Center,
  Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconTicket,
  IconSearch,
  IconBrandWhatsapp,
  IconEye,
  IconDownload,
  IconCheck,
  IconUsers,
  IconBuildingStore,
  IconCurrencyRupee,
  IconUserCheck,
  IconTrash,
  IconPlus,
  IconAdjustments,
  IconExternalLink,
} from '@tabler/icons-react';
import html2canvas from 'html2canvas';
import { CustomerPassCard } from '@/components/CustomerPassCard';
import { openWhatsAppChat } from '@/lib/whatsapp';

export default function AdminTicketBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string | null>(null);
  const [checkInFilter, setCheckInFilter] = useState<string | null>(null);

  // View Modal State
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Direct Instant Download State
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [directDownloadBooking, setDirectDownloadBooking] = useState<any | null>(null);

  // Delete Booking State
  const [bookingToDelete, setBookingToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Top-Up Voucher Balance State
  const [bookingToTopUp, setBookingToTopUp] = useState<any | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number | string>(100);
  const [topUpReason, setTopUpReason] = useState('');
  const [toppingUp, setToppingUp] = useState(false);

  // Voucher Rule Exception State
  const [bookingForRule, setBookingForRule] = useState<any | null>(null);
  const [selectedVoucherRule, setSelectedVoucherRule] = useState<string>('default');
  const [savingRule, setSavingRule] = useState(false);

  const fetchBookings = () => {
    fetch('/api/admin/ticket-bookings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.bookings) {
          setBookings(data.bookings);
        }
      })
      .catch((err) => console.error('Error fetching ticket bookings:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle direct instant pass download
  const handleDirectDownload = async (booking: any) => {
    setDownloadingId(booking.id);
    setDirectDownloadBooking(booking);
  };

  useEffect(() => {
    if (!directDownloadBooking) return;

    const timer = setTimeout(async () => {
      const el = document.getElementById(`direct-download-pass-${directDownloadBooking.id}`);
      if (!el) {
        setDownloadingId(null);
        setDirectDownloadBooking(null);
        return;
      }

      try {
        const canvas = await html2canvas(el, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: '#140305',
          logging: false,
          borderRadius: 24,
          onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
            clonedElement.style.width = '480px';
            clonedElement.style.maxWidth = '480px';
            clonedElement.style.minWidth = '480px';
          },
        } as any);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Asha-Bani-Dandiya-Raas-Pass-${directDownloadBooking.bookingNumber}.png`;
        link.href = dataUrl;
        link.click();

        notifications.show({
          title: 'Pass Downloaded',
          message: `Official pass for ${directDownloadBooking.fullName} (#${directDownloadBooking.bookingNumber}) saved to device.`,
          color: 'green',
        });
      } catch (err) {
        console.error('Direct download error:', err);
        notifications.show({
          title: 'Download Failed',
          message: 'Could not generate pass. Please try opening pass preview.',
          color: 'red',
        });
      } finally {
        setDownloadingId(null);
        setDirectDownloadBooking(null);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [directDownloadBooking]);

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (phaseFilter && b.phaseName !== phaseFilter) return false;
    if (checkInFilter === 'checked_in' && !b.isCheckedIn) return false;
    if (checkInFilter === 'pending' && b.isCheckedIn) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = (b.fullName || '').toLowerCase().includes(q);
      const mobileMatch = (b.mobile || '').includes(q);
      const idMatch = (b.bookingNumber || '').toLowerCase().includes(q);
      if (!nameMatch && !mobileMatch && !idMatch) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'success')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const totalAdults = bookings
    .filter((b) => b.paymentStatus === 'success')
    .reduce((sum, b) => sum + (b.adultCount || 1), 0);

  const totalChildren = bookings
    .filter((b) => b.paymentStatus === 'success')
    .reduce((sum, b) => sum + (b.childrenCount || 0), 0);

  const totalCheckedIn = bookings.filter((b) => b.isCheckedIn).length;

  const handleSendWhatsApp = (b: any) => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const passUrl = `${origin}/dandiyaraas/tickets/pass/${b.id}`;
      const usability = b.voucherApplicableTo === 'food'
        ? 'Food Stalls Only (Stalls 1-15)'
        : b.voucherApplicableTo === 'other'
        ? 'Commercial & Shopping Stalls (Stalls A-T)'
        : 'All 35 Stalls (Food + Commercial)';

      const msg =
        `*NAMASTE ${b.fullName.toUpperCase()}!*\n\n` +
        `Your official entry pass for *Asha Bani Dandiya Raas 6.0* is confirmed.\n\n` +
        `*Booking ID:* ${b.bookingNumber}\n` +
        `*Passes:* 1 Adult${b.childrenCount > 0 ? ` + ${b.childrenCount} Children` : ''}\n` +
        `*Included Stall Voucher:* Rs. ${b.voucherAmount} (Valid at: ${usability})\n` +
        `*Date:* 13 October 2026 (6:00 PM onwards)\n` +
        `*Venue:* Maharaja Agrasen Bhavan, Saharanpur\n\n` +
        `*View / Scan Your Pass:*\n${passUrl}`;

      openWhatsAppChat(b.mobile || '', msg);
    }
  };

  const handlePromptDelete = (b: any) => {
    setBookingToDelete(b);
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/ticket-bookings/${bookingToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete ticket pass booking');
      }

      notifications.show({
        title: 'Booking Deleted',
        message: `Ticket booking ${bookingToDelete.bookingNumber} has been removed.`,
        color: 'green',
      });

      setBookingToDelete(null);
      fetchBookings();
    } catch (err: any) {
      notifications.show({ title: 'Delete Failed', message: err.message, color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  const handlePromptTopUp = (b: any) => {
    setBookingToTopUp(b);
    setTopUpAmount(100);
    setTopUpReason('');
  };

  const handleConfirmTopUp = async () => {
    if (!bookingToTopUp) return;
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      notifications.show({ title: 'Invalid Amount', message: 'Please enter a valid top-up amount.', color: 'red' });
      return;
    }

    setToppingUp(true);
    try {
      const res = await fetch('/api/admin/ticket-bookings/topup-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketBookingId: bookingToTopUp.id,
          additionalAmount: amount,
          reason: topUpReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to top-up voucher balance');
      }

      notifications.show({
        title: 'Voucher Balance Credited',
        message: `Added ₹${amount} voucher balance to ${bookingToTopUp.bookingNumber}!`,
        color: 'green',
      });

      setBookingToTopUp(null);
      fetchBookings();
    } catch (err: any) {
      notifications.show({ title: 'Top-Up Failed', message: err.message, color: 'red' });
    } finally {
      setToppingUp(false);
    }
  };

  const handlePromptRule = (b: any) => {
    setBookingForRule(b);
    setSelectedVoucherRule(b.isCustomVoucherRule ? b.voucherApplicableTo : 'default');
  };

  const handleSaveRule = async () => {
    if (!bookingForRule) return;
    setSavingRule(true);
    try {
      const res = await fetch('/api/admin/ticket-bookings/voucher-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketBookingId: bookingForRule.id,
          voucherApplicableTo: selectedVoucherRule,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update voucher rule');
      }

      notifications.show({
        title: 'Voucher Rule Updated',
        message: `Stall usability rule updated for ${bookingForRule.bookingNumber}!`,
        color: 'green',
      });

      setBookingForRule(null);
      fetchBookings();
    } catch (err: any) {
      notifications.show({ title: 'Update Failed', message: err.message, color: 'red' });
    } finally {
      setSavingRule(false);
    }
  };

  return (
    <Container size="xl" p={0}>
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.15em' }}>
            CUSTOMER TICKETING MODULE
          </Text>
          <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            Customer Ticket Bookings
          </Title>
          <Text size="sm" c="gray.4" mt={4}>
            View and manage confirmed attendees, download official passes, and dispatch WhatsApp notifications.
          </Text>
        </Box>

        {/* Metrics Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  TOTAL TICKET REVENUE
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  ₹{totalRevenue.toLocaleString()}
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="yellow" variant="light">
                <IconCurrencyRupee size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  ADULT PASSES
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  {totalAdults}
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
                  CHILDREN PASSES
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  {totalChildren}
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="yellow" variant="light">
                <IconTicket size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  GATE CHECK-INS
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  {totalCheckedIn} / {bookings.length}
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="green" variant="light">
                <IconUserCheck size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Filters & Search */}
        <Paper p="md" radius="lg" style={{ backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <TextInput
              placeholder="Search by Name, Mobile, or Booking ID..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            <Select
              placeholder="Filter by Check-In Status"
              clearable
              data={[
                { value: 'checked_in', label: 'Checked In Only' },
                { value: 'pending', label: 'Pending Gate Entry' },
              ]}
              value={checkInFilter}
              onChange={setCheckInFilter}
            />

            <Group justify="flex-end">
              <Badge color="royalGold" variant="light" size="lg">
                {filteredBookings.length} Bookings Found
              </Badge>
            </Group>
          </SimpleGrid>
        </Paper>

        {/* Bookings Table */}
        <Paper p="md" radius="lg" style={{ backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
          {loading ? (
            <Center py={60}>
              <Stack align="center" gap="sm">
                <Loader color="royalGold" size="lg" />
                <Text size="sm" c="gray.4">
                  Loading attendee bookings...
                </Text>
              </Stack>
            </Center>
          ) : filteredBookings.length === 0 ? (
            <Text ta="center" py={40} c="gray.4">
              No ticket bookings matching your search criteria.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={950}>
              <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: 950 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Booking ID</Table.Th>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Attendee Name</Table.Th>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Mobile</Table.Th>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Passes</Table.Th>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Phase</Table.Th>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Amount</Table.Th>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Voucher Bal</Table.Th>
                    <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Gate Entry</Table.Th>
                    <Table.Th style={{ color: '#facc15', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredBookings.map((b) => (
                    <Table.Tr key={b.id}>
                      <Table.Td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fde047', whiteSpace: 'nowrap' }}>
                        {b.bookingNumber}
                      </Table.Td>
                      <Table.Td style={{ fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>{b.fullName}</Table.Td>
                      <Table.Td style={{ color: '#d1d5db', whiteSpace: 'nowrap' }}>{b.mobile}</Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Text size="xs" c="white">
                          1 Adult{b.childrenCount > 0 ? ` + ${b.childrenCount} Child${b.childrenCount > 1 ? 'ren' : ''}` : ''}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Badge size="xs" color="yellow" variant="light" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {b.phaseName}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap' }}>₹{b.totalAmount}</Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Stack gap={3}>
                          <Badge size="xs" color={b.voucherBalance > 0 ? 'green' : 'gray'} variant="light" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            ₹{b.voucherBalance}
                          </Badge>
                          {b.isAmbassadorPass ? (
                            <Badge
                              size="xs"
                              color="yellow"
                              variant="light"
                              style={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: '9px', padding: '0 4px', fontWeight: 700 }}
                            >
                              Ambassador Tier ({b.effectiveVoucherApplicableTo === 'food' ? 'Food' : b.effectiveVoucherApplicableTo === 'other' ? 'Commercial' : 'All Stalls'})
                            </Badge>
                          ) : b.isCustomVoucherRule ? (
                            <Badge
                              size="xs"
                              color={b.voucherApplicableTo === 'food' ? 'orange' : b.voucherApplicableTo === 'other' ? 'grape' : 'teal'}
                              variant="filled"
                              style={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: '9px', padding: '0 4px', fontWeight: 800 }}
                            >
                              Exception ({b.voucherApplicableTo === 'food' ? 'Food Only' : b.voucherApplicableTo === 'other' ? 'Commercial' : 'All Stalls'})
                            </Badge>
                          ) : (
                            <Text size="10px" c="gray.4" style={{ fontSize: '10px' }}>
                              Global ({b.effectiveVoucherApplicableTo === 'food' ? 'Food Only' : b.effectiveVoucherApplicableTo === 'other' ? 'Commercial' : 'All Stalls'})
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        <Badge size="xs" color={b.isCheckedIn ? 'green' : 'gray'} variant="filled" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {b.isCheckedIn ? 'CHECKED IN' : 'PENDING'}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          <Tooltip label="Download Official Pass (PNG)">
                            <ActionIcon
                              color="yellow"
                              variant="filled"
                              className="badge-gold-filled"
                              style={{ color: '#140305', backgroundColor: '#facc15' }}
                              size="sm"
                              radius="md"
                              loading={downloadingId === b.id}
                              onClick={() => handleDirectDownload(b)}
                            >
                              <IconDownload size={15} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Send WhatsApp Pass Link">
                            <ActionIcon
                              color="green"
                              variant="light"
                              size="sm"
                              radius="md"
                              onClick={() => handleSendWhatsApp(b)}
                            >
                              <IconBrandWhatsapp size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Open Live Pass Link (New Tab)">
                            <ActionIcon
                              component="a"
                              href={`/dandiyaraas/tickets/pass/${b.id}`}
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



                          <Tooltip label="Preview Pass Card">
                            <ActionIcon
                              color="blue"
                              variant="light"
                              size="sm"
                              radius="md"
                              onClick={() => setSelectedBooking(b)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Set Voucher Stall Access Exception">
                            <ActionIcon
                              color="grape"
                              variant="light"
                              size="sm"
                              radius="md"
                              onClick={() => handlePromptRule(b)}
                            >
                              <IconAdjustments size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Add / Top-Up Voucher Balance">
                            <ActionIcon
                              color="yellow"
                              variant="light"
                              size="sm"
                              radius="md"
                              onClick={() => handlePromptTopUp(b)}
                            >
                              <IconCurrencyRupee size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Delete Ticket Pass">
                            <ActionIcon
                              color="red"
                              variant="light"
                              size="sm"
                              radius="md"
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

        {/* Modal: View & Download Pass Directly in Admin Panel */}
        <Modal
          opened={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={
            <Text fw={700} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Official Festival Entry Pass Preview
            </Text>
          }
          size="lg"
          centered
          radius="xl"
          styles={{
            content: {
              backgroundColor: '#140305',
              border: '1px solid rgba(234, 179, 8, 0.35)',
            },
            header: {
              backgroundColor: '#140305',
              borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
            },
          }}
        >
          {selectedBooking && (
            <Box py="sm" style={{ display: 'flex', justifyContent: 'center' }}>
              <CustomerPassCard booking={selectedBooking} showDownloadButton={true} />
            </Box>
          )}
        </Modal>

        {/* Hidden Offscreen Container for Background Instant Pass Generation */}
        {directDownloadBooking && (
          <Box
            style={{
              position: 'fixed',
              left: -9999,
              top: -9999,
              width: 480,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            <CustomerPassCard
              booking={directDownloadBooking}
              showDownloadButton={false}
              cardId={`direct-download-pass-${directDownloadBooking.id}`}
            />
          </Box>
        )}
        {/* Top-Up Voucher Balance Modal */}
        <Modal
          opened={!!bookingToTopUp}
          onClose={() => setBookingToTopUp(null)}
          title={
            <Text fw={700} size="md" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Top-Up Food Voucher Balance
            </Text>
          }
          centered
          radius="lg"
          styles={{
            content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.4)' },
            header: { backgroundColor: '#140305' },
          }}
        >
          {bookingToTopUp && (
            <Stack gap="md">
              <Paper p="xs" radius="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
                <Group justify="space-between">
                  <Text size="xs" c="gray.4">Booking:</Text>
                  <Text size="xs" fw={700} c="white">{bookingToTopUp.bookingNumber} ({bookingToTopUp.fullName})</Text>
                </Group>
                <Group justify="space-between" mt={4}>
                  <Text size="xs" c="gray.4">Current Balance:</Text>
                  <Badge color="green" variant="filled" size="sm">₹{bookingToTopUp.voucherBalance || 0}</Badge>
                </Group>
              </Paper>

              <NumberInput
                label="Additional Voucher Amount to Add (₹)"
                placeholder="Enter voucher amount"
                value={topUpAmount}
                onChange={(val) => setTopUpAmount(val)}
                min={1}
                step={50}
                required
              />

              <TextInput
                label="Reason / Reference (Optional)"
                placeholder="Enter reason or note"
                value={topUpReason}
                onChange={(e) => setTopUpReason(e.currentTarget.value)}
              />

              <Group justify="flex-end" gap="sm" mt="md">
                <Button variant="subtle" color="gray" onClick={() => setBookingToTopUp(null)}>
                  Cancel
                </Button>
                <Button
                  className="btn-auspicious-gold"
                  loading={toppingUp}
                  onClick={handleConfirmTopUp}
                >
                  Credit ₹{Number(topUpAmount) || 0} Voucher
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Delete Ticket Pass Confirmation Modal */}
        <Modal
          opened={!!bookingToDelete}
          onClose={() => setBookingToDelete(null)}
          title={
            <Text fw={700} size="md" c="red.4">
              Delete Ticket Booking Confirmation
            </Text>
          }
          centered
          radius="lg"
          styles={{
            content: { backgroundColor: '#140305', border: '1px solid rgba(239, 68, 68, 0.4)' },
            header: { backgroundColor: '#140305' },
          }}
        >
          {bookingToDelete && (
            <Stack gap="md">
              <Text size="sm" c="gray.3">
                Are you sure you want to delete Ticket Pass <b style={{ color: '#facc15' }}>{bookingToDelete.bookingNumber}</b> for attendee{' '}
                <b style={{ color: 'white' }}>{bookingToDelete.fullName}</b>?
              </Text>
              <Text size="xs" c="gray.4">
                This will delete the customer's pass and any linked stall voucher balance. This action cannot be undone.
              </Text>

              <Group justify="flex-end" gap="sm" mt="md">
                <Button variant="subtle" color="gray" onClick={() => setBookingToDelete(null)}>
                  Cancel
                </Button>
                <Button color="red" variant="filled" loading={deleting} onClick={handleConfirmDelete}>
                  Delete Ticket Pass
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Voucher Stall Access Rule Exception Modal */}
        <Modal
          opened={!!bookingForRule}
          onClose={() => setBookingForRule(null)}
          title={
            <Text fw={700} size="md" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Set Voucher Stall Access Rule Exception
            </Text>
          }
          centered
          radius="lg"
          styles={{
            content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.4)' },
            header: { backgroundColor: '#140305' },
          }}
        >
          {bookingForRule && (
            <Stack gap="md">
              <Paper p="xs" radius="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
                <Group justify="space-between">
                  <Text size="xs" c="gray.4">Booking:</Text>
                  <Text size="xs" fw={700} c="white">{bookingForRule.bookingNumber} ({bookingForRule.fullName})</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="gray.4">Booking Type:</Text>
                  {bookingForRule.isAmbassadorPass ? (
                    <Badge color="yellow" variant="light" size="xs">
                      Campus Ambassador Reward Pass ({bookingForRule.ambassadorRefCode || 'AMB'})
                    </Badge>
                  ) : (
                    <Badge color="cyan" variant="light" size="xs">Standard Customer Ticket</Badge>
                  )}
                </Group>
                <Group justify="space-between" mt={4}>
                  <Text size="xs" c="gray.4">Current Effective Usability:</Text>
                  <Badge color="yellow" variant="light" size="sm">
                    {bookingForRule.effectiveVoucherApplicableTo === 'food'
                      ? 'Food Stalls Only (1–15)'
                      : bookingForRule.effectiveVoucherApplicableTo === 'other'
                      ? 'Commercial Stalls Only (A–T)'
                      : 'All 35 Stalls (Food + Commercial)'}
                  </Badge>
                </Group>
              </Paper>

              <Select
                label="Stall Usability Rule Override"
                description={
                  bookingForRule.isAmbassadorPass
                    ? "By default, this pass inherits the Ambassador Tier rule from the Ambassador Module"
                    : "Choose whether this customer inherits the global rule or has an exclusive exception"
                }
                data={[
                  {
                    value: 'default',
                    label: bookingForRule.isAmbassadorPass
                      ? `Inherit from Ambassador Tier Milestones (${(bookingForRule.tierVoucherApplicableTo || bookingForRule.effectiveVoucherApplicableTo) === 'food' ? 'Food Only' : (bookingForRule.tierVoucherApplicableTo || bookingForRule.effectiveVoucherApplicableTo) === 'other' ? 'Commercial Only' : 'All 35 Stalls'})`
                      : `Default Global Rule (Inherited from Site Settings)`,
                  },
                  { value: 'both', label: 'Exception: All 35 Stalls (Food 1–15 + Commercial A–T)' },
                  { value: 'food', label: 'Exception: Food Stalls Only (Stalls 1–15)' },
                  { value: 'other', label: 'Exception: Commercial & Shopping Stalls Only (Stalls A–T)' },
                ]}
                value={selectedVoucherRule}
                onChange={(val) => setSelectedVoucherRule(val || 'default')}
                required
              />

              <Text size="xs" c="gray.4">
                {selectedVoucherRule === 'default'
                  ? bookingForRule.isAmbassadorPass
                    ? 'This pass will dynamically follow the Ambassador Tier usability rule configured in Ambassador Settings.'
                    : 'This booking will dynamically follow whatever global stall rule is configured in Site Settings.'
                  : selectedVoucherRule === 'both'
                  ? 'This pass will be permitted to redeem food vouchers at ALL 35 stalls, overriding any food-only restrictions.'
                  : selectedVoucherRule === 'food'
                  ? 'This pass will strictly only be permitted to redeem vouchers at Food Stalls (1–15).'
                  : 'This pass will strictly only be permitted to redeem vouchers at Commercial & Shopping Stalls (A–T).'}
              </Text>

              <Group justify="flex-end" gap="sm" mt="md">
                <Button variant="subtle" color="gray" onClick={() => setBookingForRule(null)}>
                  Cancel
                </Button>
                <Button
                  className="btn-auspicious-gold"
                  loading={savingRule}
                  onClick={handleSaveRule}
                >
                  Save Access Rule
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
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
  SimpleGrid,
  Card,
  ThemeIcon,
  Modal,
  Tabs,
  ActionIcon,
  Divider,
  Loader,
  Center,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingStore,
  IconQrcode,
  IconPrinter,
  IconCurrencyRupee,
  IconReceipt,
  IconDownload,
  IconHistory,
  IconCheck,
  IconUser,
  IconPhone,
  IconMail,
  IconInfoCircle,
  IconEye,
} from '@tabler/icons-react';
import { INITIAL_STALLS } from '@/lib/stall-data';

export default function AdminStallVouchersPage() {
  const [loading, setLoading] = useState(true);
  const [stallEarnings, setStallEarnings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalRedeemed, setTotalRedeemed] = useState(0);

  // QR Code Cache for 35 Stalls
  const [stallQrMap, setStallQrMap] = useState<Record<string, string>>({});
  const [selectedPrintStall, setSelectedPrintStall] = useState<any | null>(null);

  // Stall Owner Details Modal State
  const [selectedStallDetails, setSelectedStallDetails] = useState<any | null>(null);

  const fetchData = () => {
    fetch('/api/admin/stall-vouchers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStallEarnings(data.stallEarnings || []);
          setTransactions(data.transactions || []);
          setTotalRedeemed(data.totalRedeemed || 0);
        }
      })
      .catch((err) => console.error('Error fetching stall vouchers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();

    // Generate QR codes for all 35 stalls
    const map: Record<string, string> = {};
    Promise.all(
      INITIAL_STALLS.map(async (stall) => {
        const payload = JSON.stringify({
          type: 'STALL_VOUCHER_TARGET',
          stall: stall.stallNumber,
          section: stall.sectionLabel,
          event: 'Asha Bani Dandiya Raas 6.0',
        });
        const qrUrl = await QRCode.toDataURL(payload, {
          width: 320,
          margin: 1,
          color: { dark: '#140305', light: '#ffffff' },
        });
        map[stall.stallNumber] = qrUrl;
      })
    ).then(() => setStallQrMap(map));
  }, []);

  const handleDownloadStallQr = (stallNumber: string) => {
    const dataUrl = stallQrMap[stallNumber];
    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Asha_Bani_Stall_${stallNumber}_QR.png`;
      a.click();
      notifications.show({
        title: 'Downloaded',
        message: `Stall ${stallNumber} QR code saved.`,
        color: 'green',
      });
    }
  };

  return (
    <Container size="xl" p={0}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center" gap="md">
          <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
            <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.15em' }}>
              STALL VOUCHER &amp; SETTLEMENTS
            </Text>
            <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
              Stall Vouchers &amp; QR Codes
            </Title>
            <Text size="sm" c="gray.4" mt={4}>
              Download printable QR stands for all 35 stalls, track real-time voucher earnings, and audit transactions.
            </Text>
          </Box>
        </Group>

        {/* Metrics Grid */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  TOTAL VOUCHERS REDEEMED
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  ₹{totalRedeemed.toLocaleString()}
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
                  TOTAL REDEMPTIONS
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  {transactions.filter((t) => t.type === 'debit').length} Transactions
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="yellow" variant="light">
                <IconReceipt size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card p="md" radius="lg" className="festive-card">
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gray.4">
                  ACTIVE STALLS
                </Text>
                <Title order={2} size="h3" c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
                  35 Stalls Configured
                </Title>
              </Box>
              <ThemeIcon size={44} radius="md" color="yellow" variant="light">
                <IconBuildingStore size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        <Tabs defaultValue="qrs" color="yellow" variant="pills">
          <Tabs.List mb="md">
            <Tabs.Tab value="qrs" leftSection={<IconQrcode size={16} />}>
              35 Printable Stall QRs
            </Tabs.Tab>
            <Tabs.Tab value="earnings" leftSection={<IconBuildingStore size={16} />}>
              Live Stall Voucher Earnings
            </Tabs.Tab>
            <Tabs.Tab value="ledger" leftSection={<IconHistory size={16} />}>
              Full Transactions Audit Ledger
            </Tabs.Tab>
          </Tabs.List>

          {/* ========================================================================= */}
          {/* TAB 1: 35 PRINTABLE STALL QRS GRID                                        */}
          {/* ========================================================================= */}
          <Tabs.Panel value="qrs">
            <Paper
              p="xl"
              radius="xl"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                {INITIAL_STALLS.map((stall) => {
                  const qr = stallQrMap[stall.stallNumber];
                  return (
                    <Card
                      key={stall.stallNumber}
                      p="md"
                      radius="lg"
                      style={{
                        backgroundColor: '#120204',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        textAlign: 'center',
                      }}
                    >
                      <Badge color="yellow" variant="filled" size="sm" mb="xs" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
                        {stall.sectionLabel}
                      </Badge>
                      <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                        STALL #{stall.stallNumber}
                      </Title>
                      <Text size="xs" c="gray.4" mb="sm">
                        {stall.description}
                      </Text>

                      {qr ? (
                        <Box
                          p="xs"
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 8,
                            width: 170,
                            margin: '0 auto',
                          }}
                        >
                          <img src={qr} alt={`Stall ${stall.stallNumber} QR`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </Box>
                      ) : (
                        <Loader size="sm" color="royalGold" my="xl" />
                      )}

                      <Text size="10px" c="gray.4" mt="xs">
                        Scan to Pay with Stall Voucher
                      </Text>

                      <Group justify="center" gap="xs" mt="sm">
                        <Button
                          size="xs"
                          variant="light"
                          color="royalGold"
                          onClick={() => handleDownloadStallQr(stall.stallNumber)}
                          leftSection={<IconDownload size={14} />}
                        >
                          QR
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="yellow"
                          onClick={() => {
                            const found = stallEarnings.find((s) => s.stallNumber.toUpperCase() === stall.stallNumber.toUpperCase());
                            setSelectedStallDetails(found || { stallNumber: stall.stallNumber, section: stall.sectionLabel, brandName: 'Available' });
                          }}
                          leftSection={<IconUser size={14} />}
                        >
                          Exhibitor
                        </Button>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Paper>
          </Tabs.Panel>

          {/* ========================================================================= */}
          {/* TAB 2: STALL EARNINGS TABLE                                               */}
          {/* ========================================================================= */}
          <Tabs.Panel value="earnings">
            <Paper
              p="md"
              radius="lg"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              {loading ? (
                <Center py="xl">
                  <Loader color="royalGold" size="md" />
                </Center>
              ) : (
                <Table.ScrollContainer minWidth={850}>
                  <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: 850 }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Stall #</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Zone / Section</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Exhibitor / Brand</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Status</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Total Voucher Redemptions</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Total Earnings (₹)</Table.Th>
                        <Table.Th style={{ color: '#facc15', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {stallEarnings.map((s) => (
                        <Table.Tr key={s.stallNumber}>
                          <Table.Td style={{ fontWeight: 800, color: '#fde047', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            STALL {s.stallNumber}
                          </Table.Td>
                          <Table.Td style={{ color: '#d1d5db', whiteSpace: 'nowrap' }}>{s.section}</Table.Td>
                          <Table.Td style={{ fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>{s.brandName}</Table.Td>
                          <Table.Td style={{ whiteSpace: 'nowrap' }}>
                            <Badge size="xs" color={s.isBooked ? 'green' : 'gray'} variant="filled" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                              {s.isBooked ? 'BOOKED' : 'VACANT'}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ color: '#ffffff', whiteSpace: 'nowrap' }}>{s.transactionCount} payments</Table.Td>
                          <Table.Td style={{ fontWeight: 800, color: '#facc15', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                            ₹{s.voucherEarnings.toLocaleString()}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <Button
                              size="xs"
                              variant="light"
                              color="yellow"
                              onClick={() => setSelectedStallDetails(s)}
                              leftSection={<IconEye size={14} />}
                            >
                              Owner Details
                            </Button>
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
          {/* TAB 3: FULL TRANSACTIONS AUDIT LEDGER                                     */}
          {/* ========================================================================= */}
          <Tabs.Panel value="ledger">
            <Paper
              p="md"
              radius="lg"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              {transactions.length === 0 ? (
                <Text size="sm" c="gray.4" ta="center" py="xl">
                  No voucher transactions recorded yet.
                </Text>
              ) : (
                <Table.ScrollContainer minWidth={850}>
                  <Table striped highlightOnHover verticalSpacing="sm" style={{ minWidth: 850 }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Timestamp</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Type</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Wallet Reference</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Stall / Details</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Amount (₹)</Table.Th>
                        <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Description</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {transactions.map((tx, idx) => {
                        const isCredit = tx.type === 'credit';
                        return (
                          <Table.Tr key={tx.id || idx}>
                            <Table.Td style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Table.Td>
                            <Table.Td style={{ whiteSpace: 'nowrap' }}>
                              <Badge
                                size="xs"
                                color={isCredit ? 'green' : 'yellow'}
                                variant="filled"
                                className={!isCredit ? 'badge-gold-filled' : undefined}
                                style={{
                                  flexShrink: 0,
                                  whiteSpace: 'nowrap',
                                  ...(!isCredit ? { color: '#140305', fontWeight: 800, backgroundColor: '#facc15' } : {}),
                                }}
                              >
                                {isCredit ? 'CREDIT' : 'DEBIT / PAY'}
                              </Badge>
                            </Table.Td>
                            <Table.Td style={{ fontFamily: 'monospace', color: '#ffffff', whiteSpace: 'nowrap' }}>
                              {tx.sourceReference}
                            </Table.Td>
                            <Table.Td style={{ color: '#facc15', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {tx.stallNumber ? `Stall ${tx.stallNumber}` : 'Wallet Initial Issue'}
                            </Table.Td>
                            <Table.Td style={{ fontWeight: 800, color: isCredit ? '#4ade80' : '#ffffff', whiteSpace: 'nowrap' }}>
                              {isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                            </Table.Td>
                            <Table.Td style={{ color: '#d1d5db', fontSize: '13px', whiteSpace: 'nowrap' }}>
                              {tx.description}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>

        {/* Stall Owner Details Modal */}
        <Modal
          opened={!!selectedStallDetails}
          onClose={() => setSelectedStallDetails(null)}
          title={
            selectedStallDetails && (
              <Group gap="xs">
                <Text fw={700} size="lg" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
                  Stall #{selectedStallDetails.stallNumber} Exhibitor Details
                </Text>
                <Badge color={selectedStallDetails.isBooked ? 'green' : 'gray'} variant="filled" size="sm">
                  {selectedStallDetails.isBooked ? 'CONFIRMED BOOKED' : 'VACANT / AVAILABLE'}
                </Badge>
              </Group>
            )
          }
          size="md"
          centered
          radius="lg"
          styles={{
            content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.4)' },
            header: { backgroundColor: '#140305', borderBottom: '1px solid rgba(234, 179, 8, 0.15)' },
          }}
        >
          {selectedStallDetails && (
            <Stack gap="md">
              <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs" c="gray.4">Stall Number &amp; Zone:</Text>
                    <Text size="sm" fw={700} c="white">Stall {selectedStallDetails.stallNumber} ({selectedStallDetails.section})</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="gray.4">Exhibitor / Brand Name:</Text>
                    <Text size="sm" fw={800} c="yellow.3">{selectedStallDetails.brandName || selectedStallDetails.booking?.brandName || 'Not Booked'}</Text>
                  </Group>
                  {selectedStallDetails.booking?.bookerName && (
                    <Group justify="space-between">
                      <Text size="xs" c="gray.4">Contact Person:</Text>
                      <Text size="sm" c="gray.2">{selectedStallDetails.booking.bookerName}</Text>
                    </Group>
                  )}
                  {selectedStallDetails.booking?.mobile && (
                    <Group justify="space-between">
                      <Text size="xs" c="gray.4">Mobile Number:</Text>
                      <Text size="sm" fw={600} c="white">+91 {selectedStallDetails.booking.mobile}</Text>
                    </Group>
                  )}
                  {selectedStallDetails.booking?.email && (
                    <Group justify="space-between">
                      <Text size="xs" c="gray.4">Email:</Text>
                      <Text size="xs" c="gray.3">{selectedStallDetails.booking.email}</Text>
                    </Group>
                  )}
                  {selectedStallDetails.booking?.stallType && (
                    <Group justify="space-between">
                      <Text size="xs" c="gray.4">Stall Category / Food Items:</Text>
                      <Text size="xs" c="gray.2">{selectedStallDetails.booking.stallType}</Text>
                    </Group>
                  )}
                  {selectedStallDetails.booking?.teamMembers && (
                    <Group justify="space-between">
                      <Text size="xs" c="gray.4">Official Passes (2 Exhibitors):</Text>
                      <Text size="xs" fw={600} c="yellow.2">{selectedStallDetails.booking.teamMembers}</Text>
                    </Group>
                  )}
                  {selectedStallDetails.booking?.bookingNumber && (
                    <Group justify="space-between">
                      <Text size="xs" c="gray.4">Booking Ref ID:</Text>
                      <Text size="xs" style={{ fontFamily: 'monospace', color: '#fde047' }}>{selectedStallDetails.booking.bookingNumber}</Text>
                    </Group>
                  )}
                </Stack>
              </Paper>

              <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <Group justify="space-between" align="center">
                  <Box>
                    <Text size="xs" c="green.4" fw={700}>TOTAL VOUCHER EARNINGS</Text>
                    <Text size="xl" fw={900} c="green.2">₹{(selectedStallDetails.voucherEarnings || 0).toLocaleString()}</Text>
                  </Box>
                  <Badge color="green" variant="filled" size="md">
                    {selectedStallDetails.transactionCount || 0} Redemptions
                  </Badge>
                </Group>
              </Paper>

              <Group justify="flex-end">
                <Button variant="default" onClick={() => setSelectedStallDetails(null)}>
                  Close
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}

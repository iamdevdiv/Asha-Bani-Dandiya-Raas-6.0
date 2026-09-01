'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Paper,
  Box,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Tooltip,
  SimpleGrid,
  ThemeIcon,
  Transition,
} from '@mantine/core';
import {
  IconCurrencyRupee,
  IconReceipt,
  IconRefresh,
  IconClock,
  IconUser,
  IconCheck,
  IconSparkles,
  IconBuildingStore,
  IconArrowDownLeft,
} from '@tabler/icons-react';

interface VoucherTx {
  id: string;
  amount: number;
  type: string;
  senderName: string;
  senderMobile?: string | null;
  senderRef: string;
  sourceType: string;
  description: string;
  createdAt: string;
}

interface Props {
  bookingId: string;
  stallNumber: string;
  brandName?: string;
}

export function StallVoucherLiveFeed({ bookingId, stallNumber, brandName }: Props) {
  const [transactions, setTransactions] = useState<VoucherTx[]>([]);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newestTxId, setNewestTxId] = useState<string | null>(null);
  const prevTxCountRef = useRef<number>(0);

  const fetchVouchers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/stalls/booking/${bookingId}/vouchers`);
      const data = await res.json();
      if (data.success) {
        const txList: VoucherTx[] = data.transactions || [];
        setTransactions(txList);
        setTotalEarned(data.totalEarned || 0);
        setLastUpdated(new Date());

        // Check if new transaction arrived during live poll
        if (prevTxCountRef.current > 0 && txList.length > prevTxCountRef.current) {
          const newest = txList[0];
          if (newest) {
            setNewestTxId(newest.id);
            setTimeout(() => setNewestTxId(null), 6000);
          }
        }
        prevTxCountRef.current = txList.length;
      }
    } catch (err) {
      console.error('Error fetching live stall vouchers:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!bookingId) return;

    // Initial fetch
    fetchVouchers();

    // Auto-update live polling every 4 seconds without refreshing the page
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchVouchers();
      }
    }, 4000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchVouchers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [bookingId]);

  const formatTxTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const formatTxDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <Paper
      p="xl"
      radius="xl"
      style={{
        backgroundColor: 'rgba(20, 3, 5, 0.92)',
        border: '1px solid rgba(234, 179, 8, 0.4)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header with Live Indicator & Auto-Update Badge */}
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md" mb="lg">
        <Box>
          <Group gap="xs" align="center" mb={4}>
            <Title
              order={3}
              className="gold-gradient-text"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)' }}
            >
              Voucher Payments Received
            </Title>
            <Badge
              color="green"
              variant="dot"
              size="sm"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontWeight: 700,
              }}
            >
              LIVE AUTO-UPDATING
            </Badge>
          </Group>
          <Text size="xs" c="gray.4">
            Live festival voucher settlements for <strong>Stall {stallNumber}</strong> {brandName ? `(${brandName})` : ''}
          </Text>
        </Box>

        <Group gap="xs" align="center">
          <Text size="11px" c="dimmed">
            Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </Text>
          <Tooltip label="Refresh settlements now">
            <ActionIcon
              variant="light"
              color="yellow"
              size="sm"
              radius="md"
              loading={refreshing}
              onClick={() => fetchVouchers(true)}
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Summary KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
        {/* Total Earned Card */}
        <Paper
          p="md"
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(20, 3, 5, 0.8) 100%)',
            border: '1px solid rgba(74, 222, 128, 0.35)',
          }}
        >
          <Group justify="space-between" align="center">
            <Box>
              <Text size="xs" fw={700} c="green.3" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                Total Voucher Earnings
              </Text>
              <Text
                size="1.8rem"
                fw={900}
                style={{
                  color: '#4ade80',
                  fontFamily: "'Cinzel', serif",
                  lineHeight: 1.2,
                  marginTop: 4,
                }}
              >
                ₹{totalEarned.toLocaleString('en-IN')}
              </Text>
              <Text size="11px" c="gray.4" mt={2}>
                Payable during final event settlement
              </Text>
            </Box>
            <ThemeIcon size={46} radius="xl" color="green" variant="light" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
              <IconCurrencyRupee size={26} color="#4ade80" />
            </ThemeIcon>
          </Group>
        </Paper>

        {/* Transactions Count Card */}
        <Paper
          p="md"
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(20, 3, 5, 0.8) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
          }}
        >
          <Group justify="space-between" align="center">
            <Box>
              <Text size="xs" fw={700} c="royalGold.3" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                Total Payments Received
              </Text>
              <Text
                size="1.8rem"
                fw={900}
                c="white"
                style={{
                  fontFamily: "'Cinzel', serif",
                  lineHeight: 1.2,
                  marginTop: 4,
                }}
              >
                {transactions.length}
                <Text component="span" size="sm" c="gray.4" fw={500} ml={6}>
                  {transactions.length === 1 ? 'Customer Payment' : 'Customer Payments'}
                </Text>
              </Text>
              <Text size="11px" c="gray.4" mt={2}>
                Redeemed at Stall {stallNumber}
              </Text>
            </Box>
            <ThemeIcon size={46} radius="xl" color="yellow" variant="light" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)' }}>
              <IconReceipt size={24} color="#facc15" />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Transaction History Feed */}
      <Box>
        <Group justify="space-between" align="center" mb="sm">
          <Text size="sm" fw={700} c="white">
            Live Settlement Transactions Feed
          </Text>
          <Text size="xs" c="dimmed">
            {transactions.length} record{transactions.length === 1 ? '' : 's'}
          </Text>
        </Group>

        {transactions.length === 0 ? (
          <Paper
            p="xl"
            radius="lg"
            ta="center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <ThemeIcon size={44} radius="xl" color="gray" variant="light" mb="sm" mx="auto">
              <IconBuildingStore size={22} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="gray.3" mb={4}>
              No voucher payments received yet
            </Text>
            <Text size="xs" c="gray.5" maw={450} mx="auto" style={{ lineHeight: 1.5 }}>
              When Dandiya Raas attendees scan and redeem their festival food or shopping vouchers at <strong>Stall {stallNumber}</strong>, their payment amount and full name will appear here instantly in real time.
            </Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {transactions.map((tx, idx) => {
              const isNewlyReceived = tx.id === newestTxId;
              return (
                <Paper
                  key={tx.id || idx}
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: isNewlyReceived
                      ? 'rgba(34, 197, 94, 0.18)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isNewlyReceived
                      ? '1px solid #4ade80'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Group justify="space-between" align="center" wrap="nowrap">
                    {/* Left: Sender Details & Icon */}
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                      <ThemeIcon
                        size={36}
                        radius="md"
                        color="green"
                        variant="light"
                        style={{
                          backgroundColor: 'rgba(74, 222, 128, 0.15)',
                          flexShrink: 0,
                        }}
                      >
                        <IconArrowDownLeft size={18} color="#4ade80" />
                      </ThemeIcon>

                      <Box style={{ minWidth: 0 }}>
                        <Group gap={6} wrap="nowrap">
                          <Text size="sm" fw={700} c="white" truncate>
                            {tx.senderName}
                          </Text>
                          {isNewlyReceived && (
                            <Badge color="green" size="xs" variant="filled">
                              NEW
                            </Badge>
                          )}
                        </Group>

                        <Group gap={8} wrap="wrap" mt={2}>
                          <Text size="11px" c="royalGold.3" fw={600}>
                            Pass: {tx.senderRef}
                          </Text>
                          <Text size="11px" c="gray.5">
                            •
                          </Text>
                          <Group gap={3} wrap="nowrap">
                            <IconClock size={11} color="#9ca3af" />
                            <Text size="11px" c="gray.4">
                              {formatTxTime(tx.createdAt)}, {formatTxDate(tx.createdAt)}
                            </Text>
                          </Group>
                        </Group>
                      </Box>
                    </Group>

                    {/* Right: Received Amount */}
                    <Box style={{ textAlign: 'right', flexShrink: 0 }}>
                      <Text
                        size="md"
                        fw={800}
                        style={{
                          color: '#4ade80',
                          fontFamily: "'Cinzel', serif",
                        }}
                      >
                        +₹{tx.amount?.toLocaleString('en-IN')}
                      </Text>
                      <Badge size="xs" color="teal" variant="light" style={{ fontSize: '9px', fontWeight: 800 }}>
                        SETTLED
                      </Badge>
                    </Box>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

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
  Switch,
  Badge,
  Loader,
  Card,
  Divider,
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
} from '@tabler/icons-react';
import { InteractiveStallGrid, StallItem } from '@/components/InteractiveStallGrid';

export default function AdminStallsPage() {
  const [stalls, setStalls] = useState<StallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState<StallItem | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      price: 3500,
      isBooked: false,
      bookedByName: '',
      bookedByBrand: '',
      bookedByMobile: '',
      bookedByEmail: '',
    },
  });

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
    form.setValues({
      price: stall.price,
      isBooked: stall.isBooked,
      bookedByName: stall.bookedByName || '',
      bookedByBrand: stall.bookedByBrand || '',
      bookedByMobile: stall.bookedByMobile || '',
      bookedByEmail: stall.bookedByEmail || '',
    });
    open();
  };

  const handleSaveStall = async (values: typeof form.values) => {
    if (!selectedStall) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/stalls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stallNumber: selectedStall.stallNumber,
          price: values.price,
          isBooked: values.isBooked,
          bookedByName: values.bookedByName,
          bookedByBrand: values.bookedByBrand,
          bookedByMobile: values.bookedByMobile,
          bookedByEmail: values.bookedByEmail,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update stall');
      }

      notifications.show({
        title: 'Stall Updated',
        message: `Stall ${selectedStall.stallNumber} details saved successfully.`,
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

  // Stats calculation
  const totalStalls = stalls.length;
  const bookedStalls = stalls.filter((s) => s.isBooked).length;
  const availableStalls = totalStalls - bookedStalls;
  const totalRevenue = stalls
    .filter((s) => s.isBooked)
    .reduce((acc, s) => acc + (s.price || 0), 0);

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" align="center" mb="lg" gap="md">
        <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
            Interactive Stall Layout &amp; Pricing Manager
          </Title>
          <Text size="sm" c="gray.4">
            Click any stall booth to edit pricing, inspect who booked it, or toggle its booking status.
          </Text>
        </Box>

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
          <Title order={3} c="white" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
            {totalStalls}
          </Title>
          <Text size="xs" c="royalGold.4">
            15 Food + 20 Commercial
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
            AVAILABLE
          </Text>
          <Title order={3} c="green.3" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
            {availableStalls}
          </Title>
          <Text size="xs" c="green.4">
            Ready for Booking
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
          <Title order={3} c="red.3" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
            {bookedStalls}
          </Title>
          <Text size="xs" c="red.4">
            {totalStalls > 0 ? `${Math.round((bookedStalls / totalStalls) * 100)}% Occupied` : '0%'}
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
            TOTAL REVENUE
          </Text>
          <Title order={3} c="yellow.2" mt={4} style={{ fontFamily: "'Cinzel', serif" }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </Title>
          <Text size="xs" c="yellow.4">
            Confirmed Collections
          </Text>
        </Paper>
      </SimpleGrid>

      {/* Main Interactive Grid */}
      <Paper
        p="xl"
        radius="xl"
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.8)',
          border: '1.5px solid rgba(234, 179, 8, 0.3)',
        }}
      >
        {loading ? (
          <Stack align="center" py={80}>
            <Loader color="royalGold" size="lg" />
            <Text size="sm" c="gray.4">
              Loading stall management grid...
            </Text>
          </Stack>
        ) : (
          <InteractiveStallGrid
            stalls={stalls}
            isAdminView
            onAdminAction={handleOpenStallModal}
          />
        )}
      </Paper>

      {/* Stall Edit & Info Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          selectedStall && (
            <Group gap="xs">
              <Text fw={800} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", fontSize: '1.25rem' }}>
                Stall {selectedStall.stallNumber} Configuration
              </Text>
              <Badge color={selectedStall.isBooked ? 'red' : 'green'}>
                {selectedStall.isBooked ? 'Currently Booked' : 'Available'}
              </Badge>
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
        {selectedStall && (
          <form onSubmit={form.onSubmit(handleSaveStall)}>
            <Stack gap="md">
              <NumberInput
                label="Stall Price"
                description="Price displayed to exhibitors for booking"
                required
                min={0}
                step={500}
                leftSection={<Text size="xs" c="yellow.3">₹</Text>}
                {...form.getInputProps('price')}
              />

              <Switch
                label="Mark Stall as Booked"
                description="Toggle booking reservation status manually"
                checked={form.values.isBooked}
                onChange={(e) => form.setFieldValue('isBooked', e.currentTarget.checked)}
                color="red"
                size="md"
              />

              {form.values.isBooked && (
                <Box
                  p="sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 8,
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                  }}
                >
                  <Text size="xs" fw={700} c="royalGold.4" mb="xs">
                    BOOKER / EXHIBITOR DETAILS
                  </Text>

                  <Stack gap="xs">
                    <TextInput
                      label="Booker Full Name"
                      placeholder="Enter booker full name"
                      leftSection={<IconUser size={14} color="#facc15" />}
                      {...form.getInputProps('bookedByName')}
                    />

                    <TextInput
                      label="Brand / Business Name"
                      placeholder="Enter business or brand name"
                      leftSection={<IconBuildingStore size={14} color="#facc15" />}
                      {...form.getInputProps('bookedByBrand')}
                    />

                    <TextInput
                      label="Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      leftSection={<IconPhone size={14} color="#facc15" />}
                      {...form.getInputProps('bookedByMobile')}
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="Enter email address"
                      leftSection={<IconMail size={14} color="#facc15" />}
                      {...form.getInputProps('bookedByEmail')}
                    />

                    {selectedStall.bookedAt && (
                      <Text size="xs" c="dimmed" mt={4}>
                        Booked on: {new Date(selectedStall.bookedAt).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </Stack>
                </Box>
              )}

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
    </Container>
  );
}

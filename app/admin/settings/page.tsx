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
  TextInput,
  Loader,
  SimpleGrid,
  Grid,
  Badge,
  Switch,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconDeviceFloppy,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconPhone,
  IconBrandInstagram,
  IconSparkles,
  IconShieldLock,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Date State Pickers
  const [eventDateVal, setEventDateVal] = useState<string | null>('2026-10-13');
  const [ticketDateVal, setTicketDateVal] = useState<string | null>('2026-09-01');

  const form = useForm({
    initialValues: {
      ticket_booking_start_date: '2026-09-01',
      ticket_booking_msg: 'Ticket bookings start from 1 September 2026',
      event_name: 'Asha Bani Dandiya Raas 6.0',
      event_edition: '6th Grand Dandiya Celebration',
      event_tagline: '6 Years of Joy, Music & Togetherness',
      event_date: '13 October 2026',
      event_time: '6:00 PM to 12:00 AM',
      stall_setup_time: '4:00 PM',
      contact_phone: '+91 6399063455',
      contact_email: 'contact@ashabani.com',
      venue_name: 'Maharaja Agrasen Bhavan',
      venue_address: 'Aggarwal Dharamshala, Saharanpur',
      instagram_url: 'https://www.instagram.com/asha_bani_dandiya_raas_6.0',
      ticket_voucher_applicable_to: 'both',
    },
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        form.setValues(data.settings);

        if (data.settings.ticket_booking_start_date) {
          setTicketDateVal(data.settings.ticket_booking_start_date);
        }
        if (data.settings.event_date) {
          // If event_date is ISO or text
          const parsed = dayjs(data.settings.event_date);
          if (parsed.isValid()) {
            setEventDateVal(parsed.format('YYYY-MM-DD'));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEventDateChange = (dateStr: string | null) => {
    setEventDateVal(dateStr);
    if (dateStr) {
      const formatted = dayjs(dateStr).format('D MMMM YYYY');
      form.setFieldValue('event_date', formatted);
    }
  };

  const handleTicketDateChange = (dateStr: string | null) => {
    setTicketDateVal(dateStr);
    if (dateStr) {
      const formatted = dayjs(dateStr).format('D MMMM YYYY');
      form.setFieldValue('ticket_booking_start_date', dateStr);
      form.setFieldValue('ticket_booking_msg', `Ticket bookings start from ${formatted}`);
    }
  };

  const handleSaveSettings = async (values: typeof form.values) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: 'Settings Saved',
          message: 'Website and event configuration updated successfully.',
          color: 'green',
        });
      }
    } catch (err: any) {
      notifications.show({
        title: 'Save Failed',
        message: err.message || 'Could not update settings.',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" align="center" mb="lg" gap="md">
        <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
            Event &amp; Website Content Settings
          </Title>
          <Text size="sm" c="gray.4">
            Manage event dates, hours, announcement notices, venue address, and contact details.
          </Text>
        </Box>
      </Group>

      {loading ? (
        <Stack align="center" py={60}>
          <Loader color="royalGold" size="lg" />
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSaveSettings)}>
          <Stack gap="xl">
            {/* Ticket Booking Announcement Card */}
            <Paper
              p={{ base: 'md', sm: 'xl' }}
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Group justify="space-between" align="center" mb="md" gap="xs" wrap="wrap">
                <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                  Ticket Booking Announcement
                </Title>
                <Badge color="royalGold" variant="light" style={{ flexShrink: 0 }}>
                  Customer Home Banner
                </Badge>
              </Group>

              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DatePickerInput
                    label="Ticket Booking Launch Date"
                    placeholder="Select launch date"
                    value={ticketDateVal}
                    onChange={handleTicketDateChange}
                    valueFormat="D MMMM YYYY"
                    leftSection={<IconCalendar size={16} color="#facc15" />}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Universal Voucher Stall Usability"
                    description="Stalls where customer pass vouchers are redeemable"
                    data={[
                      { value: 'both', label: 'All 35 Stalls (Food 1–15 + Commercial A–T)' },
                      { value: 'food', label: 'Food Stalls Only (Stalls 1–15)' },
                      { value: 'other', label: 'Commercial & Shopping Stalls (Stalls A–T)' },
                    ]}
                    {...form.getInputProps('ticket_voucher_applicable_to')}
                  />
                </Grid.Col>

                <Grid.Col span={12}>
                  <TextInput
                    label="Announcement Banner Message"
                    placeholder="Ticket bookings start from 1 September 2026"
                    required
                    {...form.getInputProps('ticket_booking_msg')}
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Event Schedule & Branding Card */}
            <Paper
              p={{ base: 'md', sm: 'xl' }}
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Title order={3} size="h4" c="white" mb="md" style={{ fontFamily: "'Cinzel', serif" }}>
                Event Schedule &amp; Branding Details
              </Title>

              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DatePickerInput
                    label="Official Event Date"
                    placeholder="Pick event date"
                    value={eventDateVal}
                    onChange={handleEventDateChange}
                    valueFormat="D MMMM YYYY"
                    required
                    leftSection={<IconCalendar size={16} color="#facc15" />}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Event Operational Hours"
                    placeholder="6:00 PM to 12:00 AM"
                    required
                    leftSection={<IconClock size={16} color="#facc15" />}
                    {...form.getInputProps('event_time')}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Stall Setup Entry Time"
                    placeholder="4:00 PM"
                    required
                    leftSection={<IconClock size={16} color="#facc15" />}
                    {...form.getInputProps('stall_setup_time')}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Event Name"
                    placeholder="Asha Bani Dandiya Raas 6.0"
                    required
                    {...form.getInputProps('event_name')}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Edition / Headline"
                    placeholder="6th Grand Dandiya Celebration"
                    required
                    {...form.getInputProps('event_edition')}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Event Tagline"
                    placeholder="6 Years of Joy, Music & Togetherness"
                    required
                    {...form.getInputProps('event_tagline')}
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Venue & Contact Card */}
            <Paper
              p={{ base: 'md', sm: 'xl' }}
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Title order={3} size="h4" c="white" mb="md" style={{ fontFamily: "'Cinzel', serif" }}>
                Venue, Contact &amp; Social Links
              </Title>
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Venue Name"
                    placeholder="Maharaja Agrasen Bhavan"
                    required
                    leftSection={<IconMapPin size={16} color="#facc15" />}
                    {...form.getInputProps('venue_name')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Venue Address / Landmark"
                    placeholder="Aggarwal Dharamshala, Saharanpur"
                    required
                    {...form.getInputProps('venue_address')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Contact Phone / WhatsApp Helpline"
                    placeholder="+91 6399063455"
                    required
                    leftSection={<IconPhone size={16} color="#facc15" />}
                    {...form.getInputProps('contact_phone')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Official Instagram URL"
                    placeholder="https://www.instagram.com/asha_bani_dandiya_raas_6.0"
                    required
                    leftSection={<IconBrandInstagram size={16} color="#facc15" />}
                    {...form.getInputProps('instagram_url')}
                  />
                </Grid.Col>
              </Grid>
            </Paper>



            <Group justify="flex-end">
              <Button
                type="submit"
                size="lg"
                loading={saving}
                className="btn-auspicious-gold"
                leftSection={<IconDeviceFloppy size={20} />}
              >
                Save All Settings
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Container>
  );
}

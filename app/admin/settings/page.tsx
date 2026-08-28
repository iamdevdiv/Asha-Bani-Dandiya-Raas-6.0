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
  Badge,
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
      <Group justify="space-between" align="center" mb="lg" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
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
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Group justify="space-between" align="center" mb="md" wrap="nowrap">
                <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                  Ticket Booking Announcement
                </Title>
                <Badge color="royalGold" variant="light">
                  Customer Home Banner
                </Badge>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <DatePickerInput
                  label="Ticket Booking Launch Date"
                  placeholder="Select launch date"
                  value={ticketDateVal}
                  onChange={handleTicketDateChange}
                  valueFormat="D MMMM YYYY"
                  leftSection={<IconCalendar size={16} color="#facc15" />}
                />

                <TextInput
                  label="Announcement Banner Message"
                  placeholder="Ticket bookings start from 1 September 2026"
                  required
                  {...form.getInputProps('ticket_booking_msg')}
                />
              </SimpleGrid>
            </Paper>

            {/* Event Schedule & Branding Card */}
            <Paper
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Title order={3} size="h4" c="white" mb="md" style={{ fontFamily: "'Cinzel', serif" }}>
                Event Schedule &amp; Branding Details
              </Title>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <DatePickerInput
                  label="Official Event Date"
                  placeholder="Pick event date"
                  value={eventDateVal}
                  onChange={handleEventDateChange}
                  valueFormat="D MMMM YYYY"
                  required
                  leftSection={<IconCalendar size={16} color="#facc15" />}
                />

                <TextInput
                  label="Event Operational Hours"
                  placeholder="6:00 PM to 12:00 AM"
                  required
                  leftSection={<IconClock size={16} color="#facc15" />}
                  {...form.getInputProps('event_time')}
                />

                <TextInput
                  label="Stall Setup Entry Time"
                  placeholder="4:00 PM"
                  required
                  leftSection={<IconClock size={16} color="#facc15" />}
                  {...form.getInputProps('stall_setup_time')}
                />

                <TextInput
                  label="Event Name"
                  placeholder="Asha Bani Dandiya Raas 6.0"
                  required
                  {...form.getInputProps('event_name')}
                />

                <TextInput
                  label="Edition / Headline"
                  placeholder="6th Grand Dandiya Celebration"
                  required
                  {...form.getInputProps('event_edition')}
                />

                <TextInput
                  label="Event Tagline"
                  placeholder="6 Years of Joy, Music & Togetherness"
                  required
                  {...form.getInputProps('event_tagline')}
                />
              </SimpleGrid>
            </Paper>

            {/* Venue & Contact Card */}
            <Paper
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Title order={3} size="h4" c="white" mb="md" style={{ fontFamily: "'Cinzel', serif" }}>
                Venue, Contact &amp; Social Links
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label="Venue Name"
                  placeholder="Maharaja Agrasen Bhavan"
                  required
                  leftSection={<IconMapPin size={16} color="#facc15" />}
                  {...form.getInputProps('venue_name')}
                />
                <TextInput
                  label="Venue Address / Landmark"
                  placeholder="Aggarwal Dharamshala, Saharanpur"
                  required
                  {...form.getInputProps('venue_address')}
                />
                <TextInput
                  label="Contact Phone / WhatsApp Helpline"
                  placeholder="+91 6399063455"
                  required
                  leftSection={<IconPhone size={16} color="#facc15" />}
                  {...form.getInputProps('contact_phone')}
                />
                <TextInput
                  label="Official Instagram URL"
                  placeholder="https://www.instagram.com/asha_bani_dandiya_raas_6.0"
                  required
                  leftSection={<IconBrandInstagram size={16} color="#facc15" />}
                  {...form.getInputProps('instagram_url')}
                />
              </SimpleGrid>
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

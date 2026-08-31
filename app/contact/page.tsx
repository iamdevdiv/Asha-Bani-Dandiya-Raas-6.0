'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Title,
  Text,
  Stack,
  Paper,
  TextInput,
  Textarea,
  Button,
  SimpleGrid,
  ThemeIcon,
  Group,
  Anchor,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconPhoneCall,
  IconMapPin,
  IconMail,
  IconBrandInstagram,
  IconSend,
  IconClock,
  IconCalendar,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<{
    name: string;
    phone: string;
    email: string;
    preferredDate: string | null;
    preferredTime: string;
    message: string;
  }>({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      preferredDate: null,
      preferredTime: 'Anytime',
      message: '',
    },
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : 'Name is required'),
      phone: (val) => (/^[6-9]\d{9}$/.test(val.trim()) ? null : 'Valid 10-digit mobile number required'),
      email: (val) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Valid email required'),
      message: (val) => (val.trim().length >= 5 ? null : 'Message must be at least 5 characters'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: 'Inquiry Received',
          message: 'Thank you for reaching out. Our event coordination team will contact you shortly.',
          color: 'green',
        });
        form.reset();
      } else {
        throw new Error(data.message || 'Failed to submit message.');
      }
    } catch (err: any) {
      notifications.show({
        title: 'Submission Error',
        message: err.message || 'Could not send message. Please call us directly at +91 6399063455.',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="festive-background">
      <Navbar />

      <Container size="lg" py={60}>
        <Stack align="center" gap="xs" mb={40} ta="center">
          <Title
            order={1}
            className="gold-gradient-text"
            style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Contact &amp; Event Support
          </Title>
          <Text size="md" c="gray.3" maw={600}>
            Have questions regarding stall allotments, passes, or event sponsorships? Connect directly with our event organizing team.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* Contact Details Card */}
          <Paper
            p="xl"
            radius="xl"
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.75)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Title order={3} size="h4" c="white" mb="lg" style={{ fontFamily: "'Cinzel', serif" }}>
              Event Information Desk
            </Title>

            <Stack gap="lg">
              <Group gap="md" align="flex-start" wrap="nowrap">
                <ThemeIcon size={44} radius="md" color="royalGold" variant="light" style={{ flexShrink: 0 }}>
                  <IconMapPin size={22} />
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" fw={700} c="royalGold.4">
                    EVENT VENUE
                  </Text>
                  <Text size="sm" fw={700} c="white">
                    Maharaja Agrasen Bhavan
                  </Text>
                  <Text size="xs" c="gray.3" style={{ wordBreak: 'break-word' }}>
                    Aggarwal Dharamshala, Saharanpur, Uttar Pradesh
                  </Text>
                </Box>
              </Group>

              <Group gap="md" align="flex-start" wrap="nowrap">
                <ThemeIcon size={44} radius="md" color="royalGold" variant="light" style={{ flexShrink: 0 }}>
                  <IconPhoneCall size={22} />
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" fw={700} c="royalGold.4">
                    HELPLINE / WHATSAPP
                  </Text>
                  <Anchor href="tel:+916399063455" size="sm" fw={700} c="yellow.2">
                    +91 6399063455
                  </Anchor>
                  <Text size="xs" c="gray.4">
                    Available 10:00 AM to 8:00 PM
                  </Text>
                </Box>
              </Group>

              <Group gap="md" align="flex-start" wrap="nowrap">
                <ThemeIcon size={44} radius="md" color="royalGold" variant="light" style={{ flexShrink: 0 }}>
                  <IconClock size={22} />
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" fw={700} c="royalGold.4">
                    EVENT DATE &amp; TIMING
                  </Text>
                  <Text size="sm" fw={700} c="white">
                    13 October 2026 (Evening 6:00 PM - 12:00 AM)
                  </Text>
                  <Text size="xs" c="gray.4">
                    Stall Exhibitor Setup: 4:00 PM onwards
                  </Text>
                </Box>
              </Group>

              <Group gap="md" align="flex-start" wrap="nowrap">
                <ThemeIcon size={44} radius="md" color="royalGold" variant="light" style={{ flexShrink: 0 }}>
                  <IconBrandInstagram size={22} />
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xs" fw={700} c="royalGold.4">
                    INSTAGRAM
                  </Text>
                  <Anchor
                    href="https://www.instagram.com/asha_bani_dandiya_raas_6.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    c="yellow.2"
                    style={{ wordBreak: 'break-all' }}
                  >
                    @asha_bani_dandiya_raas_6.0
                  </Anchor>
                </Box>
              </Group>
            </Stack>
          </Paper>

          {/* Quick Inquiry Form */}
          <Paper
            p="xl"
            radius="xl"
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.75)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Title order={3} size="h4" c="white" mb="md" style={{ fontFamily: "'Cinzel', serif" }}>
              Send an Inquiry
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="sm">
                <TextInput
                  label="Your Full Name"
                  placeholder="Enter your full name"
                  required
                  {...form.getInputProps('name')}
                />

                <TextInput
                  label="Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  required
                  maxLength={10}
                  {...form.getInputProps('phone')}
                />

                <TextInput
                  label="Email Address"
                  placeholder="Enter your email address"
                  required
                  type="email"
                  {...form.getInputProps('email')}
                />

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <DatePickerInput
                    label="Preferred Callback Date (Optional)"
                    placeholder="Pick a date"
                    clearable
                    leftSection={<IconCalendar size={16} color="#facc15" />}
                    {...form.getInputProps('preferredDate')}
                  />

                  <Select
                    label="Preferred Time Window"
                    placeholder="Select time"
                    data={[
                      { value: 'Anytime', label: 'Anytime (10 AM - 8 PM)' },
                      { value: 'Morning', label: 'Morning (10 AM - 1 PM)' },
                      { value: 'Afternoon', label: 'Afternoon (1 PM - 5 PM)' },
                      { value: 'Evening', label: 'Evening (5 PM - 8 PM)' },
                    ]}
                    leftSection={<IconClock size={16} color="#facc15" />}
                    {...form.getInputProps('preferredTime')}
                  />
                </SimpleGrid>

                <Textarea
                  label="Your Message / Query"
                  placeholder="Describe your inquiry or requirement..."
                  required
                  minRows={3}
                  {...form.getInputProps('message')}
                />

                <Button
                  type="submit"
                  size="md"
                  fullWidth
                  mt="sm"
                  loading={submitting}
                  className="btn-auspicious-gold"
                  leftSection={<IconSend size={18} />}
                >
                  Send Inquiry Message
                </Button>
              </Stack>
            </form>
          </Paper>
        </SimpleGrid>
      </Container>

      <Footer />
    </Box>
  );
}

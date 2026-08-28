'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Box,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconScan, IconPhone, IconLock, IconArrowRight } from '@tabler/icons-react';

export default function VerifierLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      mobile: '',
      password: '',
    },
    validate: {
      mobile: (val) => (/^[6-9]\d{9}$/.test(val.trim()) ? null : 'Enter a valid 10-digit mobile number'),
      password: (val) => (val.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const res = await fetch('/api/verifier/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: `Welcome, ${data.user.name}!`,
          message: 'Entry Verification desk unlocked.',
          color: 'green',
        });
        window.location.href = '/verifier/scan';
      } else {
        throw new Error(data.message || 'Login failed.');
      }
    } catch (err: any) {
      notifications.show({
        title: 'Authentication Failed',
        message: err.message || 'Invalid credentials or inactive user.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="festive-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Container size={420} w="100%">
        <Paper
          p="xl"
          radius="xl"
          style={{
            backgroundColor: 'rgba(26, 4, 8, 0.92)',
            border: '2px solid rgba(234, 179, 8, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(234, 179, 8, 0.2)',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <Box
            mx="auto"
            mb="md"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #facc15',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(234, 179, 8, 0.4)',
            }}
          >
            <Image
              src="/icon1.png"
              alt="Asha Bani Logo"
              fill
              style={{ objectFit: 'cover' }}
            />
          </Box>

          <Badge color="cyan" variant="filled" size="md" mb="xs" leftSection={<IconScan size={14} />}>
            GATE ENTRY SCANNER
          </Badge>

          <Title
            order={2}
            className="gold-gradient-text"
            style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', fontWeight: 800 }}
          >
            Asha Bani Dandiya Raas 6.0
          </Title>

          <Text size="xs" c="gray.4" mt={4} mb="lg">
            Entry Verification Desk • Authorized Gate Personnel Only
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md" ta="left">
              <TextInput
                label="Registered Mobile Number"
                placeholder="e.g. 9876543210"
                required
                maxLength={10}
                leftSection={<IconPhone size={16} color="#facc15" />}
                {...form.getInputProps('mobile')}
              />

              <PasswordInput
                label="Passcode / Password"
                placeholder="Enter your verifier password"
                required
                leftSection={<IconLock size={16} color="#facc15" />}
                {...form.getInputProps('password')}
              />

              <Button
                type="submit"
                size="md"
                fullWidth
                mt="sm"
                className="btn-auspicious-gold"
                loading={loading}
                rightSection={<IconArrowRight size={18} />}
              >
                Access Scanner Desk
              </Button>
            </Stack>
          </form>

          <Text size="xs" c="gray.5" mt="xl">
            Need credentials? Contact Event Administration.
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}

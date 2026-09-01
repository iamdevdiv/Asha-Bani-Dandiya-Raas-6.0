'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Stack,
  Paper,
  TextInput,
  PasswordInput,
  ThemeIcon,
  Alert,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconShieldLock,
  IconLock,
  IconMail,
  IconAlertCircle,
  IconSparkles,
} from '@tabler/icons-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (val) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Please enter a valid email'),
      password: (val) => (val.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleLogin = async (values: typeof form.values) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      notifications.show({
        title: 'Authentication Successful',
        message: 'Welcome to the Asha Bani Dandiya Raas Admin Console.',
        color: 'green',
      });

      window.location.href = '/admin/ticket-bookings';
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
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
      <Container size="xs" w="100%">
        <Paper
          p="xl"
          radius="xl"
          style={{
            backgroundColor: 'rgba(36, 8, 14, 0.85)',
            border: '1.5px solid rgba(234, 179, 8, 0.35)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
          }}
        >
          <Stack align="center" gap="xs" mb="lg">
            <Box
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(234, 179, 8, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(234, 179, 8, 0.5)',
                position: 'relative',
                backgroundColor: '#140305',
              }}
            >
              <Image
                src="/icon1.png"
                alt="Asha Bani Dandiya Raas Logo"
                fill
                sizes="60px"
                style={{ objectFit: 'cover' }}
              />
            </Box>

            <Badge color="royalGold" size="sm" variant="light" mt="xs">
              ADMINISTRATIVE CONSOLE
            </Badge>

            <Title
              order={2}
              className="gold-gradient-text"
              ta="center"
              style={{ fontFamily: "'Cinzel', serif", fontWeight: 800 }}
            >
              Asha Bani Dandiya Raas
            </Title>
            <Text size="xs" c="gray.4" ta="center">
              Sign in with your administrative credentials to manage stalls, bookings, and content.
            </Text>
          </Stack>

          {errorMsg && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Access Denied"
              color="red"
              variant="light"
              mb="md"
            >
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap="md">
              <TextInput
                label="Admin Email"
                placeholder="Enter admin email"
                required
                leftSection={<IconMail size={16} color="#facc15" />}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter admin password"
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
              >
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

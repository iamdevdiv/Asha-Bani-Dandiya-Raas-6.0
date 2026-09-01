'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  TextInput,
  PasswordInput,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCrown,
  IconPhone,
  IconLock,
  IconLogin,
  IconArrowLeft,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function AmbassadorLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !password) {
      notifications.show({
        title: 'Missing Details',
        message: 'Please enter your mobile number and password.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ambassadors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials or pending approval');
      }

      notifications.show({
        title: 'Welcome Back',
        message: `Logged in as ${data.ambassador.name}`,
        color: 'green',
      });

      router.push('/ambassador/dashboard');
    } catch (err: any) {
      notifications.show({
        title: 'Login Failed',
        message: err.message || 'Could not log in to ambassador dashboard.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container size="xs" py={80} style={{ flexGrow: 1 }}>
        <Stack gap="xl">
          <Button
            component={Link}
            href="/dandiyaraas"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            size="xs"
            w="fit-content"
          >
            Event Home
          </Button>

          <Box ta="center">
            <ThemeIcon size={56} radius="50%" color="yellow" variant="light" mx="auto" mb="sm">
              <IconCrown size={32} />
            </ThemeIcon>
            <Title
              order={1}
              className="gold-gradient-text"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}
            >
              Ambassador Portal
            </Title>
            <Text size="sm" c="gray.4" mt={4}>
              Sign in to track your referrals, milestone tiers, and passes.
            </Text>
          </Box>

          <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="xl"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            }}
          >
            <form onSubmit={handleLogin}>
              <Stack gap="md">
                <TextInput
                  label="Registered Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.currentTarget.value)}
                  leftSection={<IconPhone size={16} />}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter assigned password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  leftSection={<IconLock size={16} />}
                />

                <Button
                  type="submit"
                  size="md"
                  className="btn-auspicious-gold"
                  loading={loading}
                  mt="sm"
                  fullWidth
                >
                  Sign In
                </Button>

                <Group justify="center" mt="xs">
                  <Text size="xs" c="gray.4">
                    Need to apply first?{' '}
                    <Link href="/ambassador/apply" style={{ color: '#facc15', fontWeight: 600 }}>
                      Apply as Ambassador
                    </Link>
                  </Text>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}

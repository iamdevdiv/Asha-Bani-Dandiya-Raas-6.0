'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Stack,
  Paper,
  PasswordInput,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconKey, IconLock, IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';

export default function AdminSecurityPage() {
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (val) => (val.length >= 1 ? null : 'Current password is required'),
      newPassword: (val) => (val.length >= 6 ? null : 'New password must be at least 6 characters long'),
      confirmPassword: (val, values) =>
        val === values.newPassword ? null : 'Passwords do not match',
    },
  });

  const handleChangePassword = async (values: typeof form.values) => {
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to change password');
      }

      notifications.show({
        title: 'Password Changed',
        message: 'Your admin password has been updated securely.',
        color: 'green',
      });

      form.reset();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="sm" py="md">
      <Box mb="lg">
        <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
          Admin Security &amp; Password
        </Title>
        <Text size="sm" c="gray.4">
          Update the administrative access password for this dashboard.
        </Text>
      </Box>

      <Paper
        p="xl"
        radius="lg"
        style={{
          backgroundColor: 'rgba(36, 8, 14, 0.7)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
        }}
      >
        {errorMsg && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Password Update Error"
            color="red"
            variant="light"
            mb="md"
          >
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleChangePassword)}>
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              placeholder="Enter existing password"
              required
              leftSection={<IconLock size={16} color="#facc15" />}
              {...form.getInputProps('currentPassword')}
            />

            <PasswordInput
              label="New Password"
              placeholder="Minimum 6 characters"
              required
              leftSection={<IconKey size={16} color="#facc15" />}
              {...form.getInputProps('newPassword')}
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              required
              leftSection={<IconShieldCheck size={16} color="#facc15" />}
              {...form.getInputProps('confirmPassword')}
            />

            <Button
              type="submit"
              size="md"
              mt="sm"
              loading={saving}
              className="btn-auspicious-gold"
              leftSection={<IconShieldCheck size={18} />}
            >
              Update Password
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

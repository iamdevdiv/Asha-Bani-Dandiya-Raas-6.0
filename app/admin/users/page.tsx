'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Table,
  Badge,
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Switch,
  ActionIcon,
  Stack,
  Loader,
  CopyButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUserPlus,
  IconScan,
  IconTrash,
  IconCheck,
  IconShieldLock,
  IconPhone,
  IconUser,
  IconInfoCircle,
  IconLock,
  IconCopy,
} from '@tabler/icons-react';

interface UserItem {
  id: string;
  name: string;
  mobile: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      mobile: '',
      password: '',
      role: 'entry_verifier',
    },
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : 'Name must be at least 2 characters'),
      mobile: (val) => (/^[6-9]\d{9}$/.test(val.trim()) ? null : 'Enter a valid 10-digit mobile number'),
      password: (val) => (val.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: 'User Created',
          message: `${values.name} has been added as an ${values.role === 'entry_verifier' ? 'Entry Verifier' : values.role}.`,
          color: 'green',
        });
        form.reset();
        close();
        fetchUsers();
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Something went wrong',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
        notifications.show({
          title: 'Status Updated',
          message: `User is now ${!user.isActive ? 'Active' : 'Inactive'}.`,
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        notifications.show({
          title: 'User Removed',
          message: `${userToDelete.name} has been deleted.`,
          color: 'orange',
        });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setUserToDelete(null);
      closeDelete();
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    setUserToDelete({ id, name });
    openDelete();
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" align="center" mb="lg" wrap="wrap" gap="md">
        <Box>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            Administration &amp; Team Users
          </Title>
          <Text c="gray.4" size="sm">
            Manage operational staff accounts and Gate Entry Verifiers.
          </Text>
        </Box>

        <Button
          className="btn-auspicious-gold"
          leftSection={<IconUserPlus size={18} />}
          onClick={open}
        >
          Add New User
        </Button>
      </Group>

      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.75)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
        }}
      >
        {loading ? (
          <Stack align="center" py={50}>
            <Loader color="royalGold" size="md" />
            <Text size="sm" c="gray.4">
              Loading team accounts...
            </Text>
          </Stack>
        ) : users.length === 0 ? (
          <Stack align="center" py={40}>
            <IconShieldLock size={40} color="#ca8a04" />
            <Text c="gray.4" size="sm">
              No team users created yet. Click "Add New User" to create an Entry Verifier account.
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <Table.Th style={{ color: '#facc15' }}>NAME</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>MOBILE NUMBER</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>ROLE</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>STATUS</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>PORTAL ROUTE</Table.Th>
                  <Table.Th style={{ color: '#facc15', textAlign: 'right' }}>ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr key={user.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Table.Td>
                      <Group gap="xs">
                        <IconUser size={16} color="#facc15" />
                        <Text fw={600} size="sm" c="white">
                          {user.name}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconPhone size={14} color="#94a3b8" />
                        <Text size="sm" c="gray.3">
                          +91 {user.mobile}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={user.role === 'entry_verifier' ? 'cyan' : 'yellow'}
                        variant="light"
                        size="sm"
                        leftSection={<IconScan size={12} />}
                      >
                        {user.role === 'entry_verifier' ? 'Entry Verifier' : user.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleToggleStatus(user)}
                        color="green"
                        size="sm"
                        label={user.isActive ? 'Active' : 'Inactive'}
                        styles={{ label: { color: user.isActive ? '#4ade80' : '#94a3b8', fontSize: '0.8rem' } }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <CopyButton
                        value={typeof window !== 'undefined' ? `${window.location.origin}/verifier/login` : '/verifier/login'}
                        timeout={2000}
                      >
                        {({ copied, copy }) => (
                          <Button
                            size="compact-xs"
                            variant="light"
                            color={copied ? 'teal' : 'yellow'}
                            onClick={copy}
                            leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                          >
                            {copied ? 'Copied' : typeof window !== 'undefined' ? `${window.location.origin}/verifier/login` : '/verifier/login'}
                          </Button>
                        )}
                      </CopyButton>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        title="Delete User"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* Add User Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group gap="xs">
            <IconUserPlus size={20} color="#facc15" />
            <Text fw={700} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Add New Team User
            </Text>
          </Group>
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
        <form onSubmit={form.onSubmit(handleCreateUser)}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              required
              leftSection={<IconUser size={16} color="#facc15" />}
              {...form.getInputProps('name')}
            />

            <TextInput
              label="Mobile Number (10 Digits)"
              placeholder="e.g. 9876543210"
              required
              maxLength={10}
              leftSection={<IconPhone size={16} color="#facc15" />}
              {...form.getInputProps('mobile')}
            />

            <PasswordInput
              label="Password"
              placeholder="Minimum 6 characters"
              required
              leftSection={<IconLock size={16} color="#facc15" />}
              {...form.getInputProps('password')}
            />

            <Select
              label="Role Assignment"
              required
              data={[
                { value: 'entry_verifier', label: 'Entry Verifier (Gate Scanner)' },
              ]}
              {...form.getInputProps('role')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="btn-auspicious-gold"
                leftSection={<IconCheck size={18} />}
              >
                Create User
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={
          <Text fw={700} c="red.4">
            Confirm User Removal
          </Text>
        }
        styles={{
          content: {
            backgroundColor: '#140305',
            border: '1px solid rgba(239, 68, 68, 0.4)',
          },
          header: {
            backgroundColor: '#140305',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="gray.2">
            Are you sure you want to remove user <strong>{userToDelete?.name}</strong>? They will immediately lose access to the Entry Verifier scanning portal.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={closeDelete}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteUser} leftSection={<IconTrash size={16} />}>
              Delete User
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

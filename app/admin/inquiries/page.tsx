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
  Table,
  Badge,
  TextInput,
  Select,
  Modal,
  Loader,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconRefresh,
  IconEye,
  IconTrash,
  IconCheck,
  IconPhoneCall,
  IconMail,
  IconCalendar,
  IconClock,
  IconDotsVertical,
  IconMessageCircle,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>('all');
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: 'Status Updated',
          message: `Inquiry marked as ${newStatus}.`,
          color: 'green',
        });
        fetchInquiries();
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      }
    } catch (err: any) {
      notifications.show({
        title: 'Update Failed',
        message: err.message || 'Could not update status.',
        color: 'red',
      });
    }
  };

  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  const confirmDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${inquiryToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: 'Inquiry Deleted',
          message: 'Inquiry has been removed.',
          color: 'blue',
        });
        if (selectedInquiry && selectedInquiry.id === inquiryToDelete) {
          close();
        }
        fetchInquiries();
      }
    } catch (err: any) {
      notifications.show({
        title: 'Delete Failed',
        message: err.message || 'Could not delete inquiry.',
        color: 'red',
      });
    } finally {
      setInquiryToDelete(null);
      closeDeleteModal();
    }
  };

  const handleDeleteInquiry = (id: string) => {
    setInquiryToDelete(id);
    openDeleteModal();
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const query = search.toLowerCase();
    const matchesQuery =
      inq.name?.toLowerCase().includes(query) ||
      inq.phone?.toLowerCase().includes(query) ||
      inq.email?.toLowerCase().includes(query) ||
      inq.message?.toLowerCase().includes(query);

    const matchesStatus =
      filterStatus === 'all' || !filterStatus || inq.status === filterStatus;

    let matchesDate = true;
    if (filterDate && inq.createdAt) {
      const createdDay = dayjs(inq.createdAt).format('YYYY-MM-DD');
      matchesDate = filterDate === createdDay;
    }

    return matchesQuery && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge color="red" variant="filled">New</Badge>;
      case 'contacted':
        return <Badge color="yellow" variant="filled" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>Contacted</Badge>;
      case 'resolved':
        return <Badge color="green" variant="filled">Resolved</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" align="center" mb="lg" gap="md">
        <Box style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", wordBreak: 'normal' }}>
            Received Inquiries &amp; Messages
          </Title>
          <Text size="sm" c="gray.4">
            Manage inquiries, exhibitor callbacks, and questions submitted via the public contact form.
          </Text>
        </Box>

        <Button
          onClick={fetchInquiries}
          variant="light"
          color="royalGold"
          leftSection={<IconRefresh size={16} />}
          style={{ flexShrink: 0 }}
        >
          Refresh Data
        </Button>
      </Group>

      {/* Filter Toolbar */}
      <Paper
        p="md"
        radius="lg"
        mb="lg"
        style={{
          backgroundColor: 'rgba(36, 8, 14, 0.7)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
        }}
      >
        <Group justify="space-between" wrap="wrap" gap="md">
          <TextInput
            placeholder="Search by name, mobile, email, message..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} color="#facc15" />}
            style={{ flexGrow: 1, minWidth: 260 }}
          />

          <DatePickerInput
            placeholder="Filter by Date"
            value={filterDate}
            onChange={setFilterDate}
            clearable
            leftSection={<IconCalendar size={16} color="#facc15" />}
            style={{ width: 190 }}
          />

          <Select
            data={[
              { value: 'all', label: 'All Statuses' },
              { value: 'new', label: 'New' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'resolved', label: 'Resolved' },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 160 }}
          />
        </Group>
      </Paper>

      {/* Inquiries Table */}
      <Paper
        p="md"
        radius="lg"
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.8)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <Stack align="center" py={60}>
            <Loader color="royalGold" size="lg" />
            <Text size="sm" c="gray.4">
              Loading inquiries...
            </Text>
          </Stack>
        ) : filteredInquiries.length === 0 ? (
          <Stack align="center" py={60}>
            <IconMessageCircle size={48} color="#facc15" opacity={0.6} />
            <Text fw={600} size="md" c="white">
              No inquiries found
            </Text>
            <Text size="xs" c="dimmed">
              Submitted customer and vendor messages will appear here.
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={850}>
            <Table highlightOnHover verticalSpacing="sm" style={{ minWidth: 850 }}>
              <Table.Thead>
                <Table.Tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Date &amp; Time</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Sender Name</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Contact Info</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Callback Preference</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Message</Table.Th>
                  <Table.Th style={{ color: '#facc15', whiteSpace: 'nowrap' }}>Status</Table.Th>
                  <Table.Th style={{ color: '#facc15', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredInquiries.map((inq) => (
                  <Table.Tr key={inq.id}>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="xs" c="white">
                        {dayjs(inq.createdAt).format('DD MMM YYYY')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {dayjs(inq.createdAt).format('hh:mm A')}
                      </Text>
                    </Table.Td>

                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Text size="sm" fw={700} c="white">
                        {inq.name}
                      </Text>
                    </Table.Td>

                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Group gap="xs" wrap="nowrap">
                        <IconPhoneCall size={14} color="#facc15" />
                        <Text size="xs" c="yellow.2" component="a" href={`tel:${inq.phone}`} style={{ textDecoration: 'none' }}>
                          {inq.phone}
                        </Text>
                      </Group>
                      <Group gap="xs" wrap="nowrap" mt={2}>
                        <IconMail size={14} color="#94a3b8" />
                        <Text size="xs" c="gray.3" component="a" href={`mailto:${inq.email}`} style={{ textDecoration: 'none' }}>
                          {inq.email}
                        </Text>
                      </Group>
                    </Table.Td>

                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {inq.preferredDate ? (
                        <Group gap={4} wrap="nowrap">
                          <IconCalendar size={13} color="#facc15" />
                          <Text size="xs" c="gray.2">
                            {inq.preferredDate} ({inq.preferredTime || 'Anytime'})
                          </Text>
                        </Group>
                      ) : (
                        <Text size="xs" c="dimmed">
                          {inq.preferredTime || 'Anytime'}
                        </Text>
                      )}
                    </Table.Td>

                    <Table.Td style={{ minWidth: 200, maxWidth: 300 }}>
                      <Text size="xs" c="gray.3" lineClamp={2}>
                        {inq.message}
                      </Text>
                    </Table.Td>

                    <Table.Td style={{ whiteSpace: 'nowrap' }}>{getStatusBadge(inq.status)}</Table.Td>

                    <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Button
                          size="xs"
                          variant="subtle"
                          color="royalGold"
                          leftSection={<IconEye size={14} />}
                          onClick={() => {
                            setSelectedInquiry(inq);
                            open();
                          }}
                        >
                          View
                        </Button>

                        <Menu shadow="md" width={160} position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown style={{ backgroundColor: '#1a0307', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
                            <Menu.Label>Update Status</Menu.Label>
                            <Menu.Item
                              onClick={() => handleUpdateStatus(inq.id, 'new')}
                              color="red"
                            >
                              Mark New
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => handleUpdateStatus(inq.id, 'contacted')}
                              color="yellow"
                            >
                              Mark Contacted
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => handleUpdateStatus(inq.id, 'resolved')}
                              color="green"
                            >
                              Mark Resolved
                            </Menu.Item>
                            <Menu.Divider style={{ borderColor: 'rgba(234, 179, 8, 0.2)' }} />
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => handleDeleteInquiry(inq.id)}
                            >
                              Delete Inquiry
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* Inquiry Detail Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group gap="xs" wrap="nowrap">
            <IconMessageCircle size={20} color="#facc15" />
            <Text fw={800} size="md" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Inquiry Details
            </Text>
          </Group>
        }
        size="md"
        radius="lg"
        styles={{
          header: { backgroundColor: '#170407', borderBottom: '1px solid rgba(234, 179, 8, 0.2)' },
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.3)' },
        }}
      >
        {selectedInquiry && (
          <Stack gap="md" mt="sm">
            <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <Group justify="space-between" align="center" wrap="nowrap">
                <Box>
                  <Text size="xs" c="royalGold.4" fw={700}>SENDER NAME</Text>
                  <Text fw={800} size="md" c="white">{selectedInquiry.name}</Text>
                </Box>
                {getStatusBadge(selectedInquiry.status)}
              </Group>
            </Paper>

            <Group gap="md" wrap="nowrap">
              <Paper p="sm" radius="md" style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <Text size="xs" c="royalGold.4" fw={700}>PHONE</Text>
                <Text size="sm" fw={700} c="yellow.2" component="a" href={`tel:${selectedInquiry.phone}`}>
                  {selectedInquiry.phone}
                </Text>
              </Paper>

              <Paper p="sm" radius="md" style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <Text size="xs" c="royalGold.4" fw={700}>EMAIL</Text>
                <Text size="xs" c="white" component="a" href={`mailto:${selectedInquiry.email}`}>
                  {selectedInquiry.email}
                </Text>
              </Paper>
            </Group>

            <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <Text size="xs" c="royalGold.4" fw={700}>PREFERRED CALLBACK SCHEDULE</Text>
              <Text size="sm" c="white">
                {selectedInquiry.preferredDate
                  ? `${selectedInquiry.preferredDate} (${selectedInquiry.preferredTime || 'Anytime'})`
                  : `${selectedInquiry.preferredTime || 'Anytime'}`}
              </Text>
            </Paper>

            <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <Text size="xs" c="royalGold.4" fw={700} mb={4}>MESSAGE CONTENT</Text>
              <Text size="sm" c="gray.2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedInquiry.message}
              </Text>
            </Paper>

            <Group justify="space-between" mt="md">
              <Group gap="xs">
                <Button
                  size="xs"
                  color="yellow"
                  variant="light"
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'contacted')}
                >
                  Mark Contacted
                </Button>
                <Button
                  size="xs"
                  color="green"
                  variant="light"
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'resolved')}
                >
                  Mark Resolved
                </Button>
              </Group>

              <Button
                size="xs"
                color="red"
                variant="subtle"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDeleteInquiry(selectedInquiry.id)}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteInquiry}
        title="Confirm Inquiry Deletion"
        description="Are you sure you want to permanently delete this customer inquiry? This action cannot be undone."
        confirmLabel="Delete Inquiry"
        variant="danger"
      />
    </Container>
  );
}

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
  NumberInput,
  Modal,
  ActionIcon,
  Tooltip,
  Center,
  Loader,
  Switch,
  Card,
  SimpleGrid,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconDiscount2,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconCheck,
  IconTag,
  IconCalendar,
  IconPercentage,
  IconCurrencyRupee,
} from '@tabler/icons-react';
import { CouponDef } from '@/lib/stall-data';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal State
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDef | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponDef | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<string>('percentage');
  const [discountValue, setDiscountValue] = useState<number | string>(10);
  const [maxUses, setMaxUses] = useState<number | string>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success && data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (err: any) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMaxUses('');
    setMinOrderAmount(0);
    setExpiresAt('');
    setIsActive(true);
    open();
  };

  const handleOpenEdit = (c: CouponDef) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description || '');
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMaxUses(c.maxUses !== null && c.maxUses !== undefined ? c.maxUses : '');
    setMinOrderAmount(c.minOrderAmount || 0);
    setExpiresAt(c.expiresAt ? c.expiresAt.split('T')[0] : '');
    setIsActive(c.isActive);
    open();
  };

  const handleSaveCoupon = async () => {
    if (!code.trim()) {
      notifications.show({ title: 'Code Required', message: 'Please enter a coupon code.', color: 'red' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingCoupon?.id,
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType: discountType as 'percentage' | 'flat',
        discountValue: Number(discountValue) || 0,
        maxUses: maxUses !== '' ? Number(maxUses) : null,
        minOrderAmount: minOrderAmount !== '' ? Number(minOrderAmount) : 0,
        expiresAt: expiresAt ? expiresAt : null,
        isActive,
      };

      const res = await fetch('/api/admin/coupons', {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save coupon');
      }

      notifications.show({
        title: editingCoupon ? 'Coupon Updated' : 'Coupon Created',
        message: data.message || `Coupon ${payload.code} saved successfully!`,
        color: 'green',
      });

      close();
      fetchCoupons();
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.message, color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: CouponDef) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons((prev) => prev.map((item) => (item.id === c.id ? { ...item, isActive: !item.isActive } : item)));
        notifications.show({
          title: !c.isActive ? 'Coupon Activated' : 'Coupon Deactivated',
          message: `${c.code} is now ${!c.isActive ? 'Active' : 'Inactive'}.`,
          color: !c.isActive ? 'green' : 'gray',
        });
      }
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Could not toggle coupon status', color: 'red' });
    }
  };

  const handlePromptDelete = (c: CouponDef) => {
    setCouponToDelete(c);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons?id=${couponToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete coupon');
      }

      notifications.show({
        title: 'Coupon Deleted',
        message: `Coupon ${couponToDelete.code} has been deleted.`,
        color: 'green',
      });

      closeDeleteModal();
      setCouponToDelete(null);
      fetchCoupons();
    } catch (err: any) {
      notifications.show({ title: 'Delete Failed', message: err.message, color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Container size="xl" p={0}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center" gap="md">
          <Box>
            <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.15em' }}>
              TICKETING &amp; PROMOTIONS
            </Text>
            <Title order={1} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Discount Coupons
            </Title>
            <Text size="sm" c="gray.4" mt={4}>
              Create flat and percentage discount promo codes, usage caps, and 100% test pass vouchers.
            </Text>
          </Box>

          <Button
            leftSection={<IconPlus size={18} />}
            className="btn-auspicious-gold"
            onClick={handleOpenCreate}
          >
            Create New Coupon
          </Button>
        </Group>

        {/* Search Bar */}
        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: '#120204',
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}
        >
          <TextInput
            placeholder="Search coupons by code or description..."
            leftSection={<IconSearch size={18} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </Paper>

        {/* Coupons Table */}
        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: '#120204',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            overflowX: 'auto',
          }}
        >
          {loading ? (
            <Center p="xl">
              <Loader color="royalGold" size="md" />
            </Center>
          ) : filteredCoupons.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="xs">
                <IconDiscount2 size={40} color="#6b7280" />
                <Text size="sm" c="gray.4">
                  No discount coupons found. Create your first coupon above!
                </Text>
              </Stack>
            </Center>
          ) : (
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ color: '#facc15' }}>Coupon Code</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>Discount Value</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>Usage Count</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>Min Order</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>Expires On</Table.Th>
                  <Table.Th style={{ color: '#facc15' }}>Status</Table.Th>
                  <Table.Th style={{ color: '#facc15', textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCoupons.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge
                          variant="filled"
                          color="yellow"
                          className="badge-gold-filled"
                          style={{
                            fontFamily: 'monospace',
                            letterSpacing: '0.08em',
                            fontWeight: 800,
                            backgroundColor: '#facc15',
                            color: '#140305',
                          }}
                        >
                          {c.code}
                        </Badge>
                        {c.discountValue === 100 && c.discountType === 'percentage' && (
                          <Badge color="green" size="xs" variant="light">
                            100% FREE PASS
                          </Badge>
                        )}
                      </Group>
                      {c.description && (
                        <Text size="xs" c="gray.4" mt={4}>
                          {c.description}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text fw={700} size="sm" c="white">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.3">
                        <b>{c.usedCount || 0}</b> {c.maxUses ? `/ ${c.maxUses} uses` : 'uses (Unlimited)'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.3">
                        {c.minOrderAmount ? `₹${c.minOrderAmount}` : 'None'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.3">
                        {c.expiresAt ? c.expiresAt.split('T')[0] : 'No Expiry'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Switch
                        checked={c.isActive}
                        color="yellow"
                        size="sm"
                        label={c.isActive ? 'Active' : 'Inactive'}
                        onChange={() => handleToggleActive(c)}
                      />
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group gap={6} justify="flex-end">
                        <Tooltip label="Edit Coupon">
                          <ActionIcon
                            variant="light"
                            color="yellow"
                            size="sm"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Coupon">
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => handlePromptDelete(c)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      {/* Create / Edit Coupon Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={700} size="lg" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Discount Coupon'}
          </Text>
        }
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.4)' },
          header: { backgroundColor: '#140305' },
        }}
      >
        <Stack gap="md">
          <TextInput
            label="Coupon Code"
            placeholder="Enter uppercase coupon code"
            value={code}
            onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
            required
            description="Customers will enter this uppercase code during checkout"
          />

          <TextInput
            label="Description (Optional)"
            placeholder="Enter coupon description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Discount Type"
              data={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'flat', label: 'Flat Amount (₹)' },
              ]}
              value={discountType}
              onChange={(val) => setDiscountType(val || 'percentage')}
              required
            />

            <NumberInput
              label={discountType === 'percentage' ? 'Discount Percentage (%)' : 'Flat Discount (₹)'}
              value={discountValue}
              onChange={(val) => setDiscountValue(val)}
              min={1}
              max={discountType === 'percentage' ? 100 : 10000}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Max Usage Limit (Optional)"
              placeholder="Leave empty for unlimited"
              value={maxUses}
              onChange={(val) => setMaxUses(val)}
              min={1}
            />

            <NumberInput
              label="Min Booking Amount (₹)"
              value={minOrderAmount}
              onChange={(val) => setMinOrderAmount(val)}
              min={0}
            />
          </SimpleGrid>

          <TextInput
            label="Expiry Date (YYYY-MM-DD)"
            placeholder="YYYY-MM-DD"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.currentTarget.value)}
            description="Leave empty if the coupon should never expire"
          />

          <Switch
            label="Active / Usable by customers"
            checked={isActive}
            color="yellow"
            onChange={(e) => setIsActive(e.currentTarget.checked)}
            mt="xs"
          />

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" color="gray" onClick={close}>
              Cancel
            </Button>
            <Button className="btn-auspicious-gold" loading={saving} onClick={handleSaveCoupon}>
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={
          <Text fw={700} size="md" c="red.4">
            Delete Coupon Confirmation
          </Text>
        }
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(239, 68, 68, 0.4)' },
          header: { backgroundColor: '#140305' },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="gray.3">
            Are you sure you want to delete coupon code <b style={{ color: '#facc15' }}>{couponToDelete?.code}</b>? This action cannot be undone.
          </Text>

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" color="gray" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" variant="filled" loading={deleting} onClick={handleConfirmDelete}>
              Delete Coupon
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

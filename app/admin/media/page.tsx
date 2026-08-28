'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  SimpleGrid,
  TextInput,
  Switch,
  Modal,
  Loader,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPhoto,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconRefresh,
  IconCheck,
  IconSparkles,
} from '@tabler/icons-react';

interface CarouselImageItem {
  id: string;
  imageUrl: string;
  title: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<CarouselImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openedAdd, { open: openAdd, close: closeAdd }] = useDisclosure(false);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleSaveImages = async (updatedList: CarouselImageItem[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedList }),
      });
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
        notifications.show({
          title: 'Media Updated',
          message: 'Carousel slides configuration saved successfully.',
          color: 'green',
        });
      }
    } catch (err: any) {
      notifications.show({
        title: 'Save Failed',
        message: err.message || 'Could not update media slides.',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const list = [...images];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-assign display orders
    const reordered = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    setImages(reordered);
    handleSaveImages(reordered);
  };

  const handleToggleActive = (index: number, val: boolean) => {
    const list = [...images];
    list[index].isActive = val;
    setImages(list);
    handleSaveImages(list);
  };

  const handleDelete = (index: number) => {
    const list = images.filter((_, i) => i !== index);
    const reordered = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));
    setImages(reordered);
    handleSaveImages(reordered);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      notifications.show({
        title: 'Image URL Required',
        message: 'Please provide a valid image path or URL.',
        color: 'red',
      });
      return;
    }

    const newItem: CarouselImageItem = {
      id: `img_${Date.now()}`,
      imageUrl: newImageUrl.trim(),
      title: newTitle.trim() || 'Asha Bani Dandiya Celebration Moment',
      displayOrder: images.length + 1,
      isActive: true,
    };

    const updated = [...images, newItem];
    setImages(updated);
    handleSaveImages(updated);
    setNewImageUrl('');
    setNewTitle('');
    closeAdd();
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" align="center" mb="lg">
        <Box>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            Carousel &amp; Media Gallery Manager
          </Title>
          <Text size="sm" c="gray.4">
            Manage, reorder, enable/disable, and upload slides for the previous year stalls gallery.
          </Text>
        </Box>

        <Group>
          <Button
            onClick={openAdd}
            className="btn-auspicious-gold"
            leftSection={<IconPlus size={16} />}
          >
            Add New Slide
          </Button>

          <Button
            onClick={fetchMedia}
            variant="light"
            color="royalGold"
            leftSection={<IconRefresh size={16} />}
          >
            Refresh
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Stack align="center" py={60}>
          <Loader color="royalGold" size="lg" />
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {images.map((item, index) => (
            <Paper
              key={item.id || index}
              p="sm"
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.7)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 180,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#1f0406',
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title || `Slide ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />

                <Badge
                  color={item.isActive ? 'green' : 'gray'}
                  size="xs"
                  style={{ position: 'absolute', top: 8, left: 8 }}
                >
                  {item.isActive ? 'Active' : 'Disabled'}
                </Badge>
              </Box>

              <Box mt="xs" style={{ flexGrow: 1 }}>
                <Text size="xs" fw={700} c="royalGold.4">
                  SLIDE #{item.displayOrder}
                </Text>
                <Text size="sm" fw={600} c="white" lineClamp={1}>
                  {item.title || 'Untitled Slide'}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {item.imageUrl}
                </Text>
              </Box>

              <Group justify="space-between" align="center" mt="sm" pt="xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Switch
                  size="xs"
                  checked={item.isActive}
                  onChange={(e) => handleToggleActive(index, e.currentTarget.checked)}
                  label="Visible"
                />

                <Group gap={4}>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="royalGold"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                  >
                    <IconArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="royalGold"
                    disabled={index === images.length - 1}
                    onClick={() => handleMove(index, 'down')}
                  >
                    <IconArrowDown size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(index)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      )}

      {/* Add Slide Modal */}
      <Modal
        opened={openedAdd}
        onClose={closeAdd}
        title={
          <Text fw={800} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            Add Carousel Slide
          </Text>
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
        <Stack gap="md">
          <TextInput
            label="Image URL or Path"
            placeholder="e.g. /images/carousel/1U5A0775.JPG or https://..."
            required
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.currentTarget.value)}
          />

          <TextInput
            label="Slide Caption / Title"
            placeholder="e.g. Vibrant Garba Circles & Beats"
            value={newTitle}
            onChange={(e) => setNewTitle(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeAdd}>
              Cancel
            </Button>
            <Button onClick={handleAddImage} className="btn-auspicious-gold">
              Add Slide
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

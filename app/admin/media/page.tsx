'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Tabs,
  Tooltip,
  Alert,
  Center,
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
  IconPencil,
  IconUpload,
  IconCloudUpload,
  IconLink,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
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
  const [uploading, setUploading] = useState(false);

  // Add Modal State
  const [openedAdd, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string | null>('upload');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editingImage, setEditingImage] = useState<CarouselImageItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [editUploading, setEditUploading] = useState(false);

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
          title: 'Media Saved',
          message: 'Carousel slides updated successfully.',
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

  // Open Edit Modal for a specific image
  const handleOpenEdit = (item: CarouselImageItem) => {
    setEditingImage(item);
    setEditTitle(item.title || '');
    setEditImageUrl(item.imageUrl);
    setEditIsActive(item.isActive);
    openEdit();
  };

  // Save changes from Edit Modal
  const handleSaveEdit = () => {
    if (!editingImage) return;
    if (!editImageUrl.trim()) {
      notifications.show({
        title: 'Image Required',
        message: 'Slide must have a valid image.',
        color: 'red',
      });
      return;
    }

    const updatedList = images.map((img) => {
      if (img.id === editingImage.id) {
        return {
          ...img,
          title: editTitle.trim() || null,
          imageUrl: editImageUrl.trim(),
          isActive: editIsActive,
        };
      }
      return img;
    });

    setImages(updatedList);
    handleSaveImages(updatedList);
    closeEdit();
    setEditingImage(null);
  };

  // Upload a replacement image inside Edit Modal
  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setEditImageUrl(data.url);
        notifications.show({
          title: 'Image Uploaded',
          message: 'Replacement image uploaded successfully.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Upload Failed',
          message: data.message || 'Could not upload image.',
          color: 'red',
        });
      }
    } catch (err: any) {
      notifications.show({
        title: 'Upload Error',
        message: err.message || 'Server error during upload.',
        color: 'red',
      });
    } finally {
      setEditUploading(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  // Handle Drag & Drop in Add Modal
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (filesArray.length === 0) {
        notifications.show({
          title: 'Invalid Files',
          message: 'Please drop only image files (JPG, PNG, WEBP).',
          color: 'red',
        });
        return;
      }
      setSelectedFiles(filesArray);
      setFilePreviews(filesArray.map((f) => URL.createObjectURL(f)));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
      setSelectedFiles(filesArray);
      setFilePreviews(filesArray.map((f) => URL.createObjectURL(f)));
    }
  };

  // Upload and Add Slide(s)
  const handleUploadAndAdd = async () => {
    if (activeTab === 'upload') {
      if (selectedFiles.length === 0) {
        notifications.show({
          title: 'No Image Selected',
          message: 'Please select or drag-and-drop at least one image file.',
          color: 'yellow',
        });
        return;
      }

      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      try {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.urls && data.urls.length > 0) {
          const newItems: CarouselImageItem[] = data.urls.map((url: string, index: number) => ({
            id: `img_${Date.now()}_${index}`,
            imageUrl: url,
            title: newTitle.trim() || (selectedFiles[index]?.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Dandiya Celebration'),
            displayOrder: images.length + index + 1,
            isActive: true,
          }));

          const updated = [...images, ...newItems];
          setImages(updated);
          handleSaveImages(updated);

          notifications.show({
            title: 'Uploaded Successfully',
            message: `Added ${newItems.length} slide(s) to carousel.`,
            color: 'green',
          });

          // Reset modal state
          setSelectedFiles([]);
          setFilePreviews([]);
          setNewTitle('');
          closeAdd();
        } else {
          notifications.show({
            title: 'Upload Failed',
            message: data.message || 'Error uploading images to server.',
            color: 'red',
          });
        }
      } catch (err: any) {
        notifications.show({
          title: 'Upload Error',
          message: err.message || 'Network error during upload.',
          color: 'red',
        });
      } finally {
        setUploading(false);
      }
    } else {
      // Manual URL Tab
      if (!newImageUrl.trim()) {
        notifications.show({
          title: 'Image URL Required',
          message: 'Please enter a valid image URL or path.',
          color: 'yellow',
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
    }
  };

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" align="center" mb="lg">
        <Box>
          <Title order={2} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            Carousel &amp; Media Gallery Manager
          </Title>
          <Text size="sm" c="gray.4">
            Upload, edit captions, reorder, and control live visibility of previous year event photos.
          </Text>
        </Box>

        <Group>
          <Button
            onClick={openAdd}
            className="btn-auspicious-gold"
            leftSection={<IconUpload size={18} />}
          >
            Upload New Slide
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

      {/* Grid of Carousel Slides */}
      {loading ? (
        <Stack align="center" py={60}>
          <Loader color="royalGold" size="lg" />
        </Stack>
      ) : images.length === 0 ? (
        <Paper
          p="xl"
          radius="lg"
          ta="center"
          style={{ backgroundColor: 'rgba(36, 8, 14, 0.7)', border: '1px dashed rgba(234, 179, 8, 0.3)' }}
        >
          <IconPhoto size={48} color="#eab308" style={{ opacity: 0.6, margin: '0 auto' }} />
          <Title order={4} c="white" mt="md">
            No Carousel Slides Added Yet
          </Title>
          <Text size="sm" c="gray.4" mb="lg">
            Upload celebration photos to display them in the event gallery.
          </Text>
          <Button onClick={openAdd} className="btn-auspicious-gold" leftSection={<IconUpload size={16} />}>
            Upload Your First Slide
          </Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {images.map((item, index) => (
            <Paper
              key={item.id || index}
              p="sm"
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.75)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              {/* Slide Preview Image */}
              <Box
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 190,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#1f0406',
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title || `Slide ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />

                {/* Status Badges */}
                <Group justify="space-between" style={{ position: 'absolute', top: 8, left: 8, right: 8 }}>
                  <Badge
                    color={item.isActive ? 'green' : 'gray'}
                    size="xs"
                    variant="filled"
                  >
                    {item.isActive ? 'Active' : 'Hidden'}
                  </Badge>
                  <Badge size="xs" color="dark" variant="filled">
                    #{item.displayOrder || index + 1}
                  </Badge>
                </Group>
              </Box>

              {/* Slide Info & Caption */}
              <Box mt="xs" style={{ flexGrow: 1 }}>
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Box style={{ flexGrow: 1, minWidth: 0 }}>
                    <Text size="xs" fw={700} c="royalGold.4">
                      CAPTION:
                    </Text>
                    <Text size="sm" fw={600} c="white" lineClamp={2} title={item.title || 'Untitled Slide'}>
                      {item.title || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No caption set</span>}
                    </Text>
                  </Box>

                  {/* Edit Caption Button */}
                  <Tooltip label="Edit Caption &amp; Image" withArrow>
                    <ActionIcon
                      variant="light"
                      color="yellow"
                      size="md"
                      radius="md"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                <Text size="xs" c="dimmed" lineClamp={1} mt={4}>
                  {item.imageUrl}
                </Text>
              </Box>

              {/* Controls Footer */}
              <Group justify="space-between" align="center" mt="sm" pt="xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Switch
                  size="xs"
                  checked={item.isActive}
                  onChange={(e) => handleToggleActive(index, e.currentTarget.checked)}
                  label={item.isActive ? 'Visible' : 'Hidden'}
                  color="yellow"
                />

                <Group gap={4}>
                  <Tooltip label="Move Up" withArrow>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="royalGold"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                    >
                      <IconArrowUp size={14} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Move Down" withArrow>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="royalGold"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 'down')}
                    >
                      <IconArrowDown size={14} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Edit Slide" withArrow>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="yellow"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <IconPencil size={14} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Delete Slide" withArrow>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(index)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      )}

      {/* ========================================================================= */}
      {/* 1. ADD / UPLOAD SLIDE MODAL WITH DRAG & DROP                               */}
      {/* ========================================================================= */}
      <Modal
        opened={openedAdd}
        onClose={closeAdd}
        size="lg"
        title={
          <Group gap="xs">
            <IconCloudUpload size={22} color="#facc15" />
            <Text fw={800} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Upload Carousel Slides
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
        <Stack gap="md">
          <Tabs value={activeTab} onChange={setActiveTab} color="yellow" variant="pills">
            <Tabs.List mb="md">
              <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
                File Upload &amp; Drag &amp; Drop
              </Tabs.Tab>
              <Tabs.Tab value="url" leftSection={<IconLink size={16} />}>
                Image URL / Path
              </Tabs.Tab>
            </Tabs.List>

            {/* TAB 1: DRAG AND DROP FILE UPLOAD */}
            <Tabs.Panel value="upload">
              <Stack gap="md">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* Drag and Drop Zone */}
                <Paper
                  p="xl"
                  radius="md"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: isDragging ? 'rgba(234, 179, 8, 0.15)' : 'rgba(26, 4, 8, 0.6)',
                    border: `2px dashed ${isDragging ? '#facc15' : 'rgba(234, 179, 8, 0.4)'}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Stack align="center" gap="xs">
                    <IconCloudUpload size={48} color={isDragging ? '#facc15' : '#eab308'} />
                    <Text fw={700} size="md" c="white">
                      Drag &amp; drop photos here, or click to browse
                    </Text>
                    <Text size="xs" c="gray.4">
                      Supports high-resolution JPG, PNG, WEBP, and AVIF. Multiple photos supported!
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color="royalGold"
                      mt="xs"
                      leftSection={<IconPhoto size={14} />}
                    >
                      Browse Files from Device
                    </Button>
                  </Stack>
                </Paper>

                {/* Selected Files Preview Thumbnails */}
                {filePreviews.length > 0 && (
                  <Box>
                    <Text size="xs" fw={700} c="royalGold.4" mb="xs">
                      SELECTED FILES ({filePreviews.length}):
                    </Text>
                    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
                      {filePreviews.map((src, i) => (
                        <Box
                          key={i}
                          style={{
                            position: 'relative',
                            height: 80,
                            borderRadius: 6,
                            overflow: 'hidden',
                            border: '1px solid rgba(250, 204, 21, 0.3)',
                          }}
                        >
                          <Image src={src} alt="Preview" fill style={{ objectFit: 'cover' }} />
                          <Text
                            size="10px"
                            c="white"
                            p={2}
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {selectedFiles[i]?.name}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Caption Input */}
                <TextInput
                  label="Default Caption / Title"
                  placeholder="e.g. Grand Aarti &amp; Garba Moments 2026"
                  description="Will be assigned to the uploaded slide(s). You can customize captions anytime."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.currentTarget.value)}
                />
              </Stack>
            </Tabs.Panel>

            {/* TAB 2: MANUAL URL / PATH */}
            <Tabs.Panel value="url">
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
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeAdd} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadAndAdd}
              className="btn-auspicious-gold"
              loading={uploading}
              leftSection={<IconCheck size={16} />}
            >
              {activeTab === 'upload' ? `Upload & Add ${selectedFiles.length > 1 ? `(${selectedFiles.length})` : ''}` : 'Add Slide'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. EDIT SLIDE & CAPTION MODAL                                             */}
      {/* ========================================================================= */}
      <Modal
        opened={openedEdit}
        onClose={closeEdit}
        size="md"
        title={
          <Group gap="xs">
            <IconPencil size={20} color="#facc15" />
            <Text fw={800} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              Edit Carousel Slide &amp; Caption
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
        {editingImage && (
          <Stack gap="md">
            {/* Current Image Preview */}
            <Box
              style={{
                position: 'relative',
                width: '100%',
                height: 180,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                backgroundColor: '#1f0406',
              }}
            >
              <Image
                src={editImageUrl || editingImage.imageUrl}
                alt={editTitle || 'Slide'}
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>

            {/* Replace Image Button */}
            <input
              ref={editFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleEditFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="light"
              color="royalGold"
              size="xs"
              loading={editUploading}
              onClick={() => editFileInputRef.current?.click()}
              leftSection={<IconUpload size={14} />}
            >
              Replace Slide Image
            </Button>

            {/* Editable Caption */}
            <TextInput
              label="Slide Caption / Title"
              placeholder="e.g. Royal Garba Night with Live Orchestra"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.currentTarget.value)}
            />

            {/* Image URL / Path */}
            <TextInput
              label="Image Path / URL"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.currentTarget.value)}
              description="Direct server path or external URL"
            />

            {/* Visibility Toggle */}
            <Switch
              label="Visible in Carousel Gallery"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.currentTarget.checked)}
              color="yellow"
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="btn-auspicious-gold" leftSection={<IconCheck size={16} />}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

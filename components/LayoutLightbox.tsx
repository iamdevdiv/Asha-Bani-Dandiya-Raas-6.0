'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  SimpleGrid,
  Paper,
  Text,
  Modal,
  Badge,
  Group,
  ActionIcon,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconMaximize,
  IconZoomIn,
  IconInfoCircle,
  IconArrowsMaximize,
} from '@tabler/icons-react';

interface LayoutBlueprint {
  src: string;
  title: string;
  subtitle: string;
  tag: string;
}

const BLUEPRINTS: LayoutBlueprint[] = [
  {
    src: '/images/stall-layout/1.png',
    title: 'Standard Stall Dimensions',
    subtitle: '8-Foot Span with 2 Tables & Pathway',
    tag: 'Dimensions',
  },
  {
    src: '/images/stall-layout/2.png',
    title: 'Master Venue Placement Plan',
    subtitle: 'DJ Stage, Food Aisle & Commercial Zones',
    tag: 'Venue Map',
  },
  {
    src: '/images/stall-layout/3.png',
    title: 'Food Stalls Layout (1 to 15)',
    subtitle: 'Dedicated Food Zone @ ₹3,500/stall',
    tag: 'Food Zone',
  },
  {
    src: '/images/stall-layout/4.png',
    title: 'Commercial & Brand Stalls (A to T)',
    subtitle: 'Turning Premium & Front Visibility Zones',
    tag: 'Brand Zone',
  },
];

export function LayoutLightbox() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<LayoutBlueprint>(BLUEPRINTS[0]);

  const handleOpen = (bp: LayoutBlueprint) => {
    setSelectedBlueprint(bp);
    open();
  };

  return (
    <Box my="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        {BLUEPRINTS.map((bp, index) => (
          <Paper
            key={index}
            radius="lg"
            p="sm"
            onClick={() => handleOpen(bp)}
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.7)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="festive-card"
          >
            <Box
              style={{
                position: 'relative',
                width: '100%',
                height: 220,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#1f0406',
              }}
            >
              <Image
                src={bp.src}
                alt={bp.title}
                fill
                style={{ objectFit: 'contain', padding: 8 }}
              />

              {/* Hover overlay hint */}
              <Box
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(20, 3, 5, 0.75)',
                  borderRadius: '50%',
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <IconArrowsMaximize size={16} color="#facc15" />
              </Box>
            </Box>

            <Box mt="sm">
              <Group justify="space-between" align="center" mb={4}>
                <Badge size="xs" color="royalGold" variant="light">
                  {bp.tag}
                </Badge>
                <Text size="xs" c="dimmed">
                  Click to Expand
                </Text>
              </Group>
              <Text size="sm" fw={700} c="white" lineClamp={1}>
                {bp.title}
              </Text>
              <Text size="xs" c="gray.4" lineClamp={1} mt={2}>
                {bp.subtitle}
              </Text>
            </Box>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Fullscreen Lightbox Modal */}
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        centered
        title={
          <Group gap="xs">
            <Text fw={700} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
              {selectedBlueprint.title}
            </Text>
            <Badge color="royalGold" size="sm" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
              {selectedBlueprint.tag}
            </Badge>
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
        <Box p="xs">
          <Text size="sm" c="gray.3" mb="md">
            {selectedBlueprint.subtitle}
          </Text>

          <Box
            style={{
              position: 'relative',
              width: '100%',
              height: '65vh',
              borderRadius: 12,
              backgroundColor: '#0a0103',
              overflow: 'hidden',
            }}
          >
            <Image
              src={selectedBlueprint.src}
              alt={selectedBlueprint.title}
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

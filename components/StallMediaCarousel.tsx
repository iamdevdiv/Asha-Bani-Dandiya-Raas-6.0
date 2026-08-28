'use client';

import React from 'react';
import Image from 'next/image';
import { Box, Text, Paper, Badge, Group } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconSparkles, IconEye } from '@tabler/icons-react';

interface CarouselItem {
  id: string;
  imageUrl: string;
  title?: string | null;
}

interface StallMediaCarouselProps {
  images: CarouselItem[];
}

export function StallMediaCarousel({ images }: StallMediaCarouselProps) {
  if (!images || images.length === 0) {
    return null;
  }

  // Pre-curated color gradients inspired by event photography
  const gradients = [
    'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(127, 29, 29, 0.4) 100%)',
    'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(88, 28, 135, 0.4) 100%)',
    'linear-gradient(135deg, rgba(217, 119, 6, 0.3) 0%, rgba(76, 5, 25, 0.4) 100%)',
    'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(190, 18, 60, 0.4) 100%)',
    'linear-gradient(135deg, rgba(234, 88, 12, 0.3) 0%, rgba(15, 23, 42, 0.4) 100%)',
  ];

  return (
    <Box my="xl">
      <Carousel
        slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
        slideGap={{ base: 'md', sm: 'lg' }}
        withIndicators
        emblaOptions={{ align: 'start', dragFree: false, loop: true, slidesToScroll: 1 }}
        styles={{
          indicator: {
            backgroundColor: 'rgba(234, 179, 8, 0.3)',
            '&[data-active]': {
              backgroundColor: '#facc15',
              width: 24,
            },
          },
          control: {
            backgroundColor: 'rgba(20, 3, 5, 0.85)',
            borderColor: 'rgba(234, 179, 8, 0.4)',
            color: '#facc15',
            '&:hover': {
              backgroundColor: '#2a080c',
            },
          },
        }}
      >
        {images.map((img, index) => {
          const bgGrad = gradients[index % gradients.length];
          return (
            <Carousel.Slide key={img.id || index}>
              <Paper
                radius="lg"
                p="xs"
                style={{
                  background: bgGrad,
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: 340,
                }}
              >
                <Box
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.title || `Asha Bani Dandiya Raas Moment ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />

                  {/* Gradient Overlay */}
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      background: 'linear-gradient(to top, rgba(13, 2, 4, 0.9) 0%, transparent 100%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 12,
                    }}
                  >
                    <Group justify="space-between" align="center" style={{ width: '100%' }}>
                      <Text size="xs" fw={700} c="white" style={{ letterSpacing: '0.05em' }}>
                        {img.title || `Festive Moment ${index + 1}`}
                      </Text>
                      <Badge size="xs" variant="light" color="royalGold">
                        Live Event
                      </Badge>
                    </Group>
                  </Box>
                </Box>
              </Paper>
            </Carousel.Slide>
          );
        })}
      </Carousel>
    </Box>
  );
}

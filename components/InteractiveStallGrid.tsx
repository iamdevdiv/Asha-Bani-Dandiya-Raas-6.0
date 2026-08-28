'use client';

import React from 'react';
import {
  Box,
  Text,
  Badge,
  Group,
  SimpleGrid,
  Tooltip,
  Paper,
  Stack,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconSparkles,
  IconCoin,
  IconBuildingStore,
} from '@tabler/icons-react';

export interface StallItem {
  id: string;
  stallNumber: string;
  section: string;
  price: number;
  isBooked: boolean;
  bookedByName?: string | null;
  bookedByBrand?: string | null;
  bookedByMobile?: string | null;
  bookedByEmail?: string | null;
  bookedAt?: string | null;
  bookingId?: string | null;
}

interface InteractiveStallGridProps {
  stalls: StallItem[];
  selectedStallNumber?: string | null;
  onSelectStall?: (stall: StallItem) => void;
  isAdminView?: boolean;
  onAdminAction?: (stall: StallItem) => void;
}

export function InteractiveStallGrid({
  stalls,
  selectedStallNumber,
  onSelectStall,
  isAdminView = false,
  onAdminAction,
}: InteractiveStallGridProps) {
  // Group stalls into 7 rows of 5 columns
  const rows = [
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '10'],
    ['11', '12', '13', '14', '15'],
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
  ];

  const getStall = (num: string) => {
    return (
      stalls.find((s) => s.stallNumber.toUpperCase() === num.toUpperCase()) || {
        id: `stall_${num}`,
        stallNumber: num,
        section: isNaN(Number(num)) ? 'commercial' : 'food',
        price: num === 'A' || num === 'B' || num === 'R' || num === 'Q' || num === 'S' || num === 'T'
          ? 4500
          : ['K', 'L', 'M', 'N', 'O', 'P'].includes(num)
          ? 5500
          : 3500,
        isBooked: false,
      }
    );
  };

  const getSectionBadge = (stall: StallItem) => {
    if (!isNaN(Number(stall.stallNumber))) {
      return { label: 'Food Stall', color: 'orange' };
    }
    if (['A', 'B', 'R', 'Q', 'S', 'T'].includes(stall.stallNumber)) {
      return { label: 'Turning Premium', color: 'grape' };
    }
    if (['K', 'L', 'M', 'N', 'O', 'P'].includes(stall.stallNumber)) {
      return { label: 'Front Visibility', color: 'yellow' };
    }
    return { label: 'Commercial', color: 'cyan' };
  };

  return (
    <Box>
      {/* Legend */}
      <Paper
        p="md"
        mb="xl"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          borderRadius: 12,
        }}
      >
        <Group justify="space-between" wrap="wrap" gap="md">
          <Group gap="lg" wrap="wrap">
            <Group gap="xs">
              <Box
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  border: '1.5px solid #facc15',
                }}
              />
              <Text size="xs" c="gray.3">
                Available Stall
              </Text>
            </Group>

            {!isAdminView && (
              <Group gap="xs">
                <Box
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    backgroundColor: '#eab308',
                    boxShadow: '0 0 10px #facc15',
                  }}
                />
                <Text size="xs" c="yellow.3" fw={600}>
                  Selected
                </Text>
              </Group>
            )}

            <Group gap="xs">
              <Box
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: '#450a0a',
                  border: '1.5px solid #dc2626',
                  position: 'relative',
                }}
              >
                <IconX size={14} color="#f87171" style={{ position: 'absolute', top: 0, left: 0 }} />
              </Box>
              <Text size="xs" c="red.4">
                Already Booked
              </Text>
            </Group>
          </Group>

          <Group gap="xs" wrap="wrap">
            <Badge size="sm" variant="light" color="orange">
              Food: ₹3,500
            </Badge>
            <Badge size="sm" variant="light" color="cyan">
              C-J: ₹3,500
            </Badge>
            <Badge size="sm" variant="light" color="grape">
              Turning: ₹4,500
            </Badge>
            <Badge size="sm" variant="light" color="yellow">
              Front: ₹5,500
            </Badge>
          </Group>
        </Group>
      </Paper>

      {/* Grid Container */}
      <Stack gap="md">
        {rows.map((rowNumbers, rowIndex) => (
          <Box key={`row_${rowIndex}`}>
            {rowIndex === 0 && (
              <Text size="xs" fw={700} c="royalGold.4" mb={6} style={{ letterSpacing: '0.08em' }}>
                FOOD ZONE (STALLS 1–15)
              </Text>
            )}
            {rowIndex === 3 && (
              <Text size="xs" fw={700} c="royalGold.4" mt="sm" mb={6} style={{ letterSpacing: '0.08em' }}>
                COMMERCIAL &amp; BRAND ZONE (STALLS A–T)
              </Text>
            )}

            <SimpleGrid cols={{ base: 5, sm: 5, md: 5 }} spacing={{ base: 6, sm: 'md' }}>
              {rowNumbers.map((stallNum) => {
                const stall = getStall(stallNum);
                const isSelected = selectedStallNumber?.toUpperCase() === stallNum.toUpperCase();
                const isBooked = stall.isBooked;
                const badgeInfo = getSectionBadge(stall);

                return (
                  <Tooltip
                    key={stallNum}
                    label={
                      isBooked
                        ? `Stall ${stallNum} - Already Booked ${stall.bookedByBrand ? `by ${stall.bookedByBrand}` : ''}`
                        : `Stall ${stallNum} (${badgeInfo.label}) - ₹${stall.price.toLocaleString('en-IN')}`
                    }
                    position="top"
                    withArrow
                  >
                    <Box
                      className={`stall-canopy-box ${isBooked ? 'stall-booked' : ''}`}
                      onClick={() => {
                        if (isAdminView && onAdminAction) {
                          onAdminAction(stall);
                          return;
                        }
                        if (!isBooked && onSelectStall) {
                          onSelectStall(stall);
                        }
                      }}
                      style={{
                        position: 'relative',
                        borderRadius: 12,
                        backgroundColor: isSelected
                          ? 'rgba(234, 179, 8, 0.25)'
                          : isBooked
                          ? 'rgba(42, 8, 12, 0.6)'
                          : 'rgba(30, 7, 12, 0.55)',
                        border: isSelected
                          ? '2.5px solid #facc15'
                          : isBooked
                          ? '1.5px solid rgba(220, 38, 38, 0.4)'
                          : '1.5px solid rgba(234, 179, 8, 0.3)',
                        boxShadow: isSelected
                          ? '0 0 20px rgba(250, 204, 21, 0.6), inset 0 0 15px rgba(250, 204, 21, 0.2)'
                          : 'none',
                        padding: '12px 6px 8px 6px',
                        textAlign: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Canopy SVG Header */}
                      <svg
                        viewBox="0 0 100 35"
                        style={{
                          width: '100%',
                          maxHeight: 28,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        <path
                          d="M 5,28 L 15,6 L 85,6 L 95,28 Q 85,32 75,28 Q 65,32 55,28 Q 45,32 35,28 Q 25,32 15,28 Z"
                          fill={isSelected ? '#eab308' : isBooked ? '#7f1d1d' : '#9a3412'}
                          stroke={isSelected ? '#fef08a' : '#d97706'}
                          strokeWidth="1.5"
                        />
                        {/* Stripes on canopy */}
                        <line x1="25" y1="6" x2="25" y2="28" stroke="#fde047" strokeWidth="1" opacity="0.6" />
                        <line x1="45" y1="6" x2="45" y2="28" stroke="#fde047" strokeWidth="1" opacity="0.6" />
                        <line x1="65" y1="6" x2="65" y2="28" stroke="#fde047" strokeWidth="1" opacity="0.6" />
                        <line x1="80" y1="6" x2="80" y2="28" stroke="#fde047" strokeWidth="1" opacity="0.6" />
                      </svg>

                      {/* Stall Number */}
                      <Text
                        fw={900}
                        size="lg"
                        c={isSelected ? 'yellow.2' : isBooked ? 'red.3' : 'gray.1'}
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: '1.25rem',
                          lineHeight: 1.1,
                        }}
                      >
                        {stallNum}
                      </Text>

                      {/* Price / Status */}
                      <Text
                        size="xs"
                        fw={700}
                        c={isSelected ? 'yellow.1' : isBooked ? 'red.4' : 'royalGold.3'}
                        style={{ fontSize: '0.72rem', marginTop: 2 }}
                      >
                        {isBooked ? 'BOOKED' : `₹${stall.price.toLocaleString('en-IN')}`}
                      </Text>

                      {/* Crossout overlay if booked */}
                      {isBooked && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(20, 3, 5, 0.45)',
                            pointerEvents: 'none',
                          }}
                        >
                          <Box
                            style={{
                              transform: 'rotate(-25deg)',
                              backgroundColor: 'rgba(220, 38, 38, 0.85)',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              letterSpacing: '0.08em',
                              padding: '2px 8px',
                              borderRadius: 4,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            }}
                          >
                            BOOKED
                          </Box>
                        </Box>
                      )}

                      {/* Selected check badge */}
                      {isSelected && !isBooked && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: '#eab308',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconCheck size={12} color="#2a080c" stroke={3} />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

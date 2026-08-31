'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Text,
  Title,
  Button,
  Group,
  Stack,
  SimpleGrid,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconDownload,
  IconMapPin,
  IconCalendar,
  IconClock,
  IconBuildingStore,
} from '@tabler/icons-react';
import html2canvas from 'html2canvas';

export interface CustomerPassData {
  id?: string;
  bookingNumber: string;
  fullName: string;
  mobile?: string;
  email?: string;
  adultCount?: number;
  childrenCount?: number;
  childrenNames?: string | string[];
  childrenNamesList?: string[];
  phaseName?: string;
  totalAmount?: number;
  voucherAmount?: number;
  voucherBalance?: number;
  voucherApplicableTo?: string;
  qrCodeDataUrl?: string | null;
  isCheckedIn?: boolean;
  checkedInAt?: string | null;
}

interface CustomerPassCardProps {
  booking: CustomerPassData;
  showDownloadButton?: boolean;
  onDownloadComplete?: () => void;
  cardId?: string;
}

export function CustomerPassCard({
  booking,
  showDownloadButton = true,
  onDownloadComplete,
  cardId,
}: CustomerPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Parse children names
  let parsedChildren: string[] = [];
  if (Array.isArray(booking.childrenNamesList)) {
    parsedChildren = booking.childrenNamesList;
  } else if (Array.isArray(booking.childrenNames)) {
    parsedChildren = booking.childrenNames;
  } else if (typeof booking.childrenNames === 'string' && booking.childrenNames.trim()) {
    try {
      const parsed = JSON.parse(booking.childrenNames);
      if (Array.isArray(parsed)) parsedChildren = parsed;
      else parsedChildren = booking.childrenNames.split(',').map((s) => s.trim());
    } catch {
      parsedChildren = booking.childrenNames.split(',').map((s) => s.trim());
    }
  }

  const childCount = booking.childrenCount ?? parsedChildren.length;
  const voucherAmt = booking.voucherAmount ?? 100;
  const voucherUsability =
    booking.voucherApplicableTo === 'food'
      ? 'Food Stalls Only (Stalls 1–15)'
      : booking.voucherApplicableTo === 'other'
      ? 'Commercial & Shopping Stalls (Stalls A–T)'
      : 'All 35 Stalls (Food + Commercial)';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // Capture element at 2.5x scale with fixed 480px width
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#140305',
        logging: false,
        borderRadius: 24,
        onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
          clonedElement.style.width = '480px';
          clonedElement.style.maxWidth = '480px';
          clonedElement.style.minWidth = '480px';
        },
      } as any);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Asha-Bani-Dandiya-Raas-Pass-${booking.bookingNumber}.png`;
      link.href = dataUrl;
      link.click();

      notifications.show({
        title: 'Pass Downloaded',
        message: `Official festival pass #${booking.bookingNumber} has been saved as an image.`,
        color: 'green',
      });

      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (err) {
      console.error('Error downloading pass:', err);
      notifications.show({
        title: 'Download Failed',
        message: 'Could not generate pass image. Please take a screenshot.',
        color: 'red',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Stack gap="md" align="center" w="100%">
      {/* Pass Card Container */}
      <Box
        id={cardId}
        ref={cardRef}
        className="ornament-corner-container"
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'linear-gradient(145deg, #2a080c 0%, #1c0407 45%, #120204 100%)',
          border: '2.5px solid #facc15',
          borderRadius: 24,
          padding: '28px 22px 24px 22px',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(234, 179, 8, 0.3)',
          position: 'relative',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* 4 Authentic Ornamental Corner Brackets */}
        <Box className="ornament-bracket ornament-tl" />
        <Box className="ornament-bracket ornament-tr" />
        <Box className="ornament-bracket ornament-bl" />
        <Box className="ornament-bracket ornament-br" />

        <Stack align="center" gap="xs">
          {/* Header Subtitle */}
          <Text
            size="xs"
            fw={700}
            c="royalGold.3"
            style={{
              letterSpacing: '0.2em',
              fontFamily: "'Cinzel', serif",
              textAlign: 'center',
            }}
          >
            ASHA BANI DANDIYA RAAS 6.0
          </Text>

          {/* Main Title */}
          <Title
            order={2}
            size="h3"
            c="white"
            ta="center"
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 800,
              letterSpacing: '0.04em',
              textShadow: '0 2px 10px rgba(0,0,0,0.6)',
            }}
          >
            OFFICIAL FESTIVAL ENTRY PASS
          </Title>

          {/* Attendee Details Card */}
          <Box
            w="100%"
            p="sm"
            my={2}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 14,
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <SimpleGrid cols={2} spacing="xs">
              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  ATTENDEE NAME
                </Text>
                <Text size="sm" fw={800} c="white" style={{ wordBreak: 'break-word', fontFamily: "'Cinzel', serif" }}>
                  {booking.fullName}
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  BOOKING REF
                </Text>
                <Text size="xs" c="yellow.3" fw={700} style={{ fontFamily: 'monospace' }}>
                  {booking.bookingNumber}
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  ADULT PASS
                </Text>
                <Text size="xs" c="gray.2" fw={600}>
                  1 Attendee
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  CHILDREN PASSES
                </Text>
                <Text size="xs" c="gray.2" fw={600}>
                  {childCount > 0 ? `${childCount} Child${childCount > 1 ? 'ren' : ''} (<55")` : 'None'}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Accompanying Children Names */}
            {parsedChildren.length > 0 && (
              <Box mt="xs" pt="xs" style={{ borderTop: '1px solid rgba(234, 179, 8, 0.15)' }}>
                <Text size="xs" c="royalGold.4" fw={700} mb={2} style={{ letterSpacing: '0.05em' }}>
                  ACCOMPANYING CHILDREN ({parsedChildren.length})
                </Text>
                <Text size="xs" c="gray.3">
                  {parsedChildren.join(', ')}
                </Text>
              </Box>
            )}
          </Box>

          {/* Included Free Stall Voucher Perk Banner */}
          <Box
            w="100%"
            p="xs"
            style={{
              background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.2) 0%, rgba(36, 8, 14, 0.7) 100%)',
              borderRadius: 12,
              border: '1px dashed rgba(250, 204, 21, 0.5)',
            }}
          >
            <Group gap="xs" wrap="nowrap" align="center">
              <IconBuildingStore size={22} color="#facc15" style={{ flexShrink: 0 }} />
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={800} c="yellow.3">
                  INCLUDED ₹{voucherAmt} STALL VOUCHER
                </Text>
                <Text size="xs" c="gray.3" style={{ fontSize: '0.72rem', lineHeight: 1.25 }}>
                  Valid at: <strong style={{ color: '#fef08a' }}>{voucherUsability}</strong>
                </Text>
              </Box>
            </Group>
          </Box>

          {/* QR Code Container */}
          {booking.qrCodeDataUrl ? (
            <Box
              p={8}
              my={2}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                boxShadow: '0 6px 25px rgba(0,0,0,0.6)',
                textAlign: 'center',
              }}
            >
              <Image
                src={booking.qrCodeDataUrl}
                alt={`QR Code Pass for ${booking.bookingNumber}`}
                width={180}
                height={180}
                unoptimized
                style={{ display: 'block', margin: '0 auto' }}
              />
              <Text size="xs" c="#1a0307" fw={800} mt={3} style={{ letterSpacing: '0.06em' }}>
                SCAN AT GATE TO VERIFY
              </Text>
            </Box>
          ) : (
            <Text size="xs" c="gray.4">
              Generating pass QR...
            </Text>
          )}

          {/* Schedule & Venue Box */}
          <Box
            w="100%"
            p="xs"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 10,
              border: '1px solid rgba(234, 179, 8, 0.2)',
              fontSize: '0.75rem',
            }}
          >
            <Group justify="space-between" wrap="nowrap" mb={4}>
              <Group gap={4} align="center">
                <IconCalendar size={13} color="#facc15" />
                <Text size="xs" c="yellow.2" fw={600}>
                  13 October 2026
                </Text>
              </Group>
              <Group gap={4} align="center">
                <IconClock size={13} color="#facc15" />
                <Text size="xs" c="yellow.2" fw={600}>
                  6:00 PM – 12:00 AM
                </Text>
              </Group>
            </Group>
            <Group gap={4} justify="center" align="center">
              <IconMapPin size={13} color="#facc15" />
              <Text size="xs" c="gray.3" ta="center">
                Maharaja Agrasen Bhavan, Aggarwal Dharamshala, Saharanpur
              </Text>
            </Group>
          </Box>

          {/* Footer Note */}
          <Text size="xs" c="gray.4" ta="center" mt={2} style={{ fontSize: '0.68rem' }}>
            Helpline: +91 6399063455 • Single Gate Entry Verification
          </Text>
        </Stack>
      </Box>

      {/* Download Pass Button */}
      {showDownloadButton && (
        <Button
          onClick={handleDownload}
          loading={downloading}
          size="md"
          className="btn-auspicious-gold"
          leftSection={<IconDownload size={18} />}
          style={{ width: '100%', maxWidth: 480 }}
        >
          Download Official Pass (PNG)
        </Button>
      )}
    </Stack>
  );
}

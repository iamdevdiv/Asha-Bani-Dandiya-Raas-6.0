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
  Paper,
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconMapPin, IconCalendar, IconClock, IconPhone, IconUsers } from '@tabler/icons-react';
import html2canvas from 'html2canvas';

export interface PassBookingData {
  bookingNumber: string;
  stallNumber: string;
  brandName: string;
  bookerName: string;
  mobile: string;
  email?: string;
  stallType?: string;
  teamMembers?: string;
  qrCodeDataUrl?: string | null;
  isCheckedIn?: boolean;
  checkedInAt?: string | null;
}

interface ExhibitorPassCardProps {
  booking: PassBookingData;
  showDownloadButton?: boolean;
}

export function ExhibitorPassCard({ booking, showDownloadButton = true }: ExhibitorPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Parse team members (expecting "Member 1 & Member 2" or comma separated)
  const teamList = booking.teamMembers
    ? booking.teamMembers.split(/[,&]|\band\b/i).map((m) => m.trim()).filter(Boolean)
    : [booking.bookerName];

  const member1 = teamList[0] || booking.bookerName;
  const member2 = teamList[1] || '(Single Attendee)';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // Allow DOM to settle and capture at fixed 480px width at 2.5x scale
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
      link.download = `Asha-Bani-Dandiya-Raas-Stall-${booking.stallNumber}-Pass.png`;
      link.href = dataUrl;
      link.click();

      notifications.show({
        title: 'Pass Downloaded',
        message: `Official pass for Stall ${booking.stallNumber} has been saved as an image.`,
        color: 'green',
      });
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
        ref={cardRef}
        className="ornament-corner-container"
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'linear-gradient(145deg, #2a080c 0%, #1c0407 45%, #120204 100%)',
          border: '2.5px solid #facc15',
          borderRadius: 24,
          padding: 'clamp(20px, 4.5vw, 28px) clamp(12px, 3.5vw, 22px)',
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
            OFFICIAL EXHIBITOR PASS
          </Title>

          {/* Stall Number Badge */}
          <Box
            my={6}
            py={8}
            px={32}
            style={{
              background: 'linear-gradient(135deg, #fef08a 0%, #facc15 50%, #ca8a04 100%)',
              borderRadius: 14,
              boxShadow: '0 6px 20px rgba(234, 179, 8, 0.45)',
              textAlign: 'center',
              border: '1px solid #fffbeb',
            }}
          >
            <Text
              fw={900}
              c="#2a080c"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '1.85rem',
                letterSpacing: '0.06em',
                lineHeight: 1.1,
              }}
            >
              STALL {booking.stallNumber}
            </Text>
          </Box>

          {/* Brand & Booker Details Card */}
          <Box
            w="100%"
            p="sm"
            my={4}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 14,
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <SimpleGrid cols={2} spacing="xs">
              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  BRAND NAME
                </Text>
                <Text size="sm" fw={800} c="white" style={{ wordBreak: 'break-word' }}>
                  {booking.brandName}
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  CONTACT PERSON
                </Text>
                <Text size="sm" fw={600} c="white" style={{ wordBreak: 'break-word' }}>
                  {booking.bookerName}
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  MOBILE
                </Text>
                <Text size="xs" c="gray.2">
                  {booking.mobile}
                </Text>
              </Box>

              <Box>
                <Text size="xs" c="royalGold.4" fw={700} style={{ letterSpacing: '0.05em' }}>
                  BOOKING REF
                </Text>
                <Text size="xs" c="yellow.3" fw={700}>
                  {booking.bookingNumber}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Team Members Section (2 Members) */}
            <Box mt="xs" pt="xs" style={{ borderTop: '1px solid rgba(234, 179, 8, 0.15)' }}>
              <Text size="xs" c="royalGold.4" fw={700} mb={3} style={{ letterSpacing: '0.05em' }}>
                ALLOTTED TEAM MEMBERS (2 PASSES)
              </Text>
              <Group justify="space-between" wrap="nowrap">
                <Text size="xs" c="gray.2" fw={600}>
                  1. {member1}
                </Text>
                <Text size="xs" c="gray.2" fw={600}>
                  2. {member2}
                </Text>
              </Group>
            </Box>
          </Box>

          {/* QR Code Container */}
          {booking.qrCodeDataUrl ? (
            <Box
              p={8}
              my={4}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                boxShadow: '0 6px 25px rgba(0,0,0,0.6)',
                textAlign: 'center',
              }}
            >
              <Image
                src={booking.qrCodeDataUrl}
                alt={`QR Code Pass for Stall ${booking.stallNumber}`}
                width={190}
                height={190}
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
            p={{ base: '8px 10px', sm: '10px 14px' }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              borderRadius: 12,
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="xs" mb={6}>
              <Group gap={6} wrap="nowrap" align="center">
                <IconCalendar size={14} color="#facc15" style={{ flexShrink: 0 }} />
                <Text size="xs" c="yellow.2" fw={600} style={{ whiteSpace: 'nowrap' }}>
                  13 October 2026
                </Text>
              </Group>
              <Group gap={6} wrap="nowrap" align="center">
                <IconClock size={14} color="#facc15" style={{ flexShrink: 0 }} />
                <Text size="xs" c="yellow.2" fw={600} style={{ whiteSpace: 'nowrap' }}>
                  Setup 4 PM • Event 6 PM–12 AM
                </Text>
              </Group>
            </Group>
            <Group gap={6} wrap="nowrap" align="flex-start">
              <IconMapPin size={14} color="#facc15" style={{ flexShrink: 0, marginTop: 2 }} />
              <Text size="xs" c="gray.3" style={{ lineHeight: 1.35, fontSize: '0.74rem', flex: 1, minWidth: 0 }}>
                Maharaja Agrasen Bhavan, Aggarwal Dharamshala, Saharanpur
              </Text>
            </Group>
          </Box>

          {/* Footer Note */}
          <Text size="xs" c="gray.4" ta="center" mt={2} style={{ fontSize: '0.68rem' }}>
            Helpline: +91 6399063455 • Non-Refundable &amp; Non-Transferable
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

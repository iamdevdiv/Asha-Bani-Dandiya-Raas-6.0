'use client';

import React from 'react';
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Title,
  ThemeIcon,
  Box,
  Paper,
} from '@mantine/core';
import {
  IconTrash,
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconCheck,
} from '@tabler/icons-react';

export interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
  loading?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon,
  loading = false,
}: ConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'red',
          defaultIcon: <IconTrash size={22} color="#ffffff" />,
          borderColor: 'rgba(239, 68, 68, 0.4)',
          glowColor: 'rgba(239, 68, 68, 0.25)',
          titleColor: '#fecdd3',
          confirmBtnClass: 'btn-auspicious-crimson',
          confirmColor: 'red',
        };
      case 'warning':
        return {
          iconColor: 'yellow',
          defaultIcon: <IconAlertTriangle size={22} color="#140305" />,
          borderColor: 'rgba(234, 179, 8, 0.4)',
          glowColor: 'rgba(234, 179, 8, 0.25)',
          titleColor: '#fef08a',
          confirmBtnClass: 'btn-auspicious-gold',
          confirmColor: 'yellow',
        };
      case 'success':
        return {
          iconColor: 'green',
          defaultIcon: <IconCheck size={22} color="#ffffff" />,
          borderColor: 'rgba(34, 197, 94, 0.4)',
          glowColor: 'rgba(34, 197, 94, 0.25)',
          titleColor: '#bbf7d0',
          confirmBtnClass: '',
          confirmColor: 'green',
        };
      case 'info':
      default:
        return {
          iconColor: 'cyan',
          defaultIcon: <IconInfoCircle size={22} color="#ffffff" />,
          borderColor: 'rgba(6, 182, 212, 0.4)',
          glowColor: 'rgba(6, 182, 212, 0.25)',
          titleColor: '#cffafe',
          confirmBtnClass: '',
          confirmColor: 'cyan',
        };
    }
  };

  const styleConfig = getVariantStyles();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="xl"
      size="md"
      withCloseButton={false}
      padding={0}
      overlayProps={{
        backgroundOpacity: 0.75,
        blur: 6,
      }}
      styles={{
        content: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
        header: {
          display: 'none',
        },
        body: {
          padding: 0,
        },
      }}
    >
      <Paper
        p={24}
        radius="xl"
        style={{
          background: 'linear-gradient(180deg, #1c050a 0%, #110204 100%)',
          border: `1px solid ${styleConfig.borderColor}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${styleConfig.glowColor}`,
        }}
      >
        <Stack gap="lg">
          {/* Header Icon + Title & Description */}
          <Group align="flex-start" gap="md" wrap="nowrap">
            <ThemeIcon
              size={46}
              radius="xl"
              color={styleConfig.iconColor}
              variant="filled"
              style={{
                flexShrink: 0,
                boxShadow: `0 0 15px ${styleConfig.glowColor}`,
              }}
            >
              {icon || styleConfig.defaultIcon}
            </ThemeIcon>

            <Box style={{ flex: 1 }}>
              {title && (
                <Title
                  order={3}
                  size="h4"
                  c={styleConfig.titleColor}
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    marginBottom: 6,
                    letterSpacing: '0.02em',
                  }}
                >
                  {title}
                </Title>
              )}
              <Text size="sm" c="gray.3" style={{ lineHeight: 1.55 }}>
                {description}
              </Text>
            </Box>
          </Group>

          {/* Action Buttons */}
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </Button>

            <Button
              className={styleConfig.confirmBtnClass}
              color={styleConfig.confirmColor}
              onClick={onConfirm}
              loading={loading}
              leftSection={
                variant === 'danger' ? (
                  <IconTrash size={16} />
                ) : (
                  <IconCheck size={16} />
                )
              }
            >
              {confirmLabel}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Modal>
  );
}

export default ConfirmationModal;

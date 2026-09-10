'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  Textarea,
  Tabs,
  Badge,
  Loader,
  SimpleGrid,
  Alert,
  Switch,
  Tooltip,
  ActionIcon,
  Divider,
  Card,
  ThemeIcon,
  SegmentedControl,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconMessage2,
  IconBrandWhatsapp,
  IconDeviceFloppy,
  IconRefresh,
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconSparkles,
  IconTicket,
  IconBuildingStore,
  IconCrown,
  IconDeviceMobile,
  IconSend,
  IconShare,
  IconVariable,
  IconArrowBackUp,
} from '@tabler/icons-react';
import { DEFAULT_TEMPLATES, renderMessageTemplate } from '@/lib/message-templates-core';

export default function AdminMessageTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);

  // Template contents state
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [definitions, setDefinitions] = useState<Record<string, any>>(DEFAULT_TEMPLATES);
  const [activePhase, setActivePhase] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [ambassadorSameForAll, setAmbassadorSameForAll] = useState<boolean>(true);
  const [selectedAmbassadorTierTab, setSelectedAmbassadorTierTab] = useState<string>('tier_1');

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<string | null>('sms');

  // Input refs for cursor-based token insertion
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/message-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || {});
        if (data.definitions) setDefinitions(data.definitions);
        if (data.activePhase) setActivePhase(data.activePhase);
        if (data.tiers) setTiers(data.tiers);

        const sameForAll = data.templates?.template_ambassador_same_for_all !== 'false';
        setAmbassadorSameForAll(sameForAll);
      } else {
        throw new Error(data.message || 'Failed to load templates');
      }
    } catch (err: any) {
      console.error('Error fetching message templates:', err);
      notifications.show({
        title: 'Fetch Error',
        message: err.message || 'Could not load templates',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateChange = (key: string, value: string) => {
    setTemplates((prev) => ({ ...prev, [key]: value }));
  };

  // Insert variable token at the cursor position
  const handleInsertToken = (templateKey: string, token: string) => {
    const textarea = textareaRefs.current[templateKey];
    const currentValue = templates[templateKey] !== undefined ? templates[templateKey] : definitions[templateKey]?.defaultText || '';

    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const nextValue = currentValue.substring(0, start) + token + currentValue.substring(end);
      handleTemplateChange(templateKey, nextValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 50);
    } else {
      handleTemplateChange(templateKey, currentValue + token);
    }

    notifications.show({
      title: 'Token Inserted',
      message: `Added ${token} to template`,
      color: 'yellow',
      autoClose: 1500,
    });
  };

  const handleSaveAll = async (overrideTemplates?: Record<string, string>) => {
    setSaving(true);
    try {
      const payload = {
        templates: {
          ...(overrideTemplates || templates),
          template_ambassador_same_for_all: ambassadorSameForAll ? 'true' : 'false',
        },
      };

      const res = await fetch('/api/admin/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save templates');
      }

      setTemplates(data.templates);
      notifications.show({
        title: 'Templates Saved',
        message: 'All SMS and WhatsApp message templates updated successfully!',
        color: 'green',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Save Failed',
        message: err.message || 'Could not save message templates',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSingle = async (key: string) => {
    setResetting(key);
    try {
      const res = await fetch('/api/admin/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetKey: key }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset template');
      }

      setTemplates(data.templates);
      notifications.show({
        title: 'Template Reset',
        message: data.message || 'Template restored to factory default.',
        color: 'yellow',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Reset Failed',
        message: err.message,
        color: 'red',
      });
    } finally {
      setResetting(null);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset ALL SMS and WhatsApp templates to their factory defaults?')) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetAll: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset all templates');
      }

      setTemplates(data.templates);
      setAmbassadorSameForAll(true);
      notifications.show({
        title: 'All Templates Reset',
        message: 'All templates restored to system defaults.',
        color: 'green',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Reset Error',
        message: err.message,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper to calculate SMS segments (standard GSM 160 chars / Unicode 70 chars)
  const calculateSmsMetrics = (text: string) => {
    const chars = text.length;
    // Check for unicode chars
    const isUnicode = /[^\u0000-\u00ff]/.test(text);
    const limit = isUnicode ? 70 : 160;
    const segments = Math.max(1, Math.ceil(chars / limit));
    return { chars, segments, limit, isUnicode };
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md" py={80}>
          <Loader color="royalGold" size="lg" />
          <Text size="sm" c="gray.4" fw={600}>
            Loading SMS & WhatsApp message templates engine...
          </Text>
        </Stack>
      </Container>
    );
  }

  // Renders an individual template editor card with token chips & real-time phone preview
  const renderTemplateCard = (
    templateKey: string,
    overrideTitle?: string,
    overrideDesc?: string
  ) => {
    const def = definitions[templateKey];
    if (!def) return null;

    const currentText = templates[templateKey] !== undefined ? templates[templateKey] : def.defaultText;
    const metrics = calculateSmsMetrics(currentText);
    const samplePreview = renderMessageTemplate(currentText, def.samplePreviewData);
    const isWhatsApp = def.category === 'whatsapp';

    return (
      <Paper
        key={templateKey}
        p={{ base: 'md', sm: 'xl' }}
        radius="xl"
        style={{
          backgroundColor: 'rgba(20, 3, 5, 0.9)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
            <Box style={{ flex: 1, minWidth: 260 }}>
              <Group gap="xs" align="center">
                <Badge
                  color={isWhatsApp ? 'teal' : 'royalGold'}
                  variant="filled"
                  size="sm"
                  style={{ fontWeight: 800 }}
                >
                  {isWhatsApp ? 'WHATSAPP' : 'TEXTBEE SMS'}
                </Badge>
                <Title order={3} size="h4" c="white">
                  {overrideTitle || def.title}
                </Title>
              </Group>
              <Text size="xs" c="gray.4" mt={4}>
                {overrideDesc || def.description}
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<IconArrowBackUp size={14} />}
                loading={resetting === templateKey}
                onClick={() => handleResetSingle(templateKey)}
              >
                Reset to Default
              </Button>
            </Group>
          </Group>

          {/* Clickable Variable Tokens */}
          <Paper
            p="sm"
            radius="md"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px dashed rgba(234, 179, 8, 0.3)',
            }}
          >
            <Group gap={6} align="center" mb={6}>
              <IconVariable size={15} color="#facc15" />
              <Text size="xs" fw={700} c="royalGold.4">
                CLICKABLE VARIABLES (Click any token to insert into template):
              </Text>
            </Group>

            <Group gap={6} wrap="wrap">
              {def.availableTokens.map((item: any) => (
                <Tooltip
                  key={item.token}
                  label={`${item.label} (e.g. ${item.example})`}
                  withArrow
                  position="top"
                >
                  <Badge
                    color="royalGold"
                    variant="outline"
                    size="sm"
                    style={{
                      cursor: 'pointer',
                      textTransform: 'none',
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(234, 179, 8, 0.08)',
                      borderColor: 'rgba(234, 179, 8, 0.4)',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => handleInsertToken(templateKey, item.token)}
                  >
                    + {item.token}
                  </Badge>
                </Tooltip>
              ))}
            </Group>
          </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* Left: Template Editor */}
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="gray.3">
                  TEMPLATE EDITOR
                </Text>
                <Group gap="xs">
                  <Badge variant="dot" color={metrics.isUnicode ? 'orange' : 'green'} size="xs">
                    {metrics.chars} chars
                  </Badge>
                  {!isWhatsApp && (
                    <Badge variant="outline" color="yellow" size="xs">
                      {metrics.segments} SMS {metrics.segments > 1 ? 'segments' : 'segment'}
                    </Badge>
                  )}
                </Group>
              </Group>

              <Textarea
                ref={(el) => {
                  textareaRefs.current[templateKey] = el;
                }}
                value={currentText}
                onChange={(e) => handleTemplateChange(templateKey, e.currentTarget.value)}
                minRows={8}
                maxRows={14}
                autosize
                styles={{
                  input: {
                    backgroundColor: '#0a0102',
                    borderColor: 'rgba(234, 179, 8, 0.35)',
                    color: '#fef08a',
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '13px',
                    lineHeight: '1.5',
                  },
                }}
              />
            </Stack>

            {/* Right: Live Mobile Device Mockup */}
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="gray.3">
                  LIVE PHONE PREVIEW (Rendered with sample data)
                </Text>
                <Badge color={isWhatsApp ? 'teal' : 'blue'} variant="light" size="xs">
                  {isWhatsApp ? 'WhatsApp Bubble' : 'SMS Screen'}
                </Badge>
              </Group>

              <Box
                style={{
                  backgroundColor: '#080102',
                  border: '2px solid rgba(250, 204, 21, 0.3)',
                  borderRadius: '16px',
                  padding: '14px',
                  minHeight: '190px',
                  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Phone Header Mockup */}
                <Group justify="space-between" align="center" pb="xs" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Group gap={6}>
                    <ThemeIcon color={isWhatsApp ? 'teal' : 'royalGold'} size="xs" radius="xl">
                      {isWhatsApp ? <IconBrandWhatsapp size={11} /> : <IconDeviceMobile size={11} />}
                    </ThemeIcon>
                    <Text size="xs" fw={700} c="white">
                      Asha Bani 6.0 Gateway
                    </Text>
                  </Group>
                  <Text size="xs" c="gray.5">
                    Just now
                  </Text>
                </Group>

                {/* Message Bubble */}
                <Box
                  p="sm"
                  my="xs"
                  style={{
                    backgroundColor: isWhatsApp ? '#054640' : 'rgba(42, 8, 14, 0.85)',
                    border: isWhatsApp ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(234, 179, 8, 0.25)',
                    borderRadius: '12px',
                    alignSelf: 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <Text
                    size="xs"
                    c="gray.1"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: '1.45',
                    }}
                  >
                    {samplePreview}
                  </Text>
                </Box>

                <Text size="xs" c="dimmed" ta="right">
                  ✓✓ Delivered
                </Text>
              </Box>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Paper>
    );
  };

  return (
    <Container size="xl" py={40}>
      <Stack gap="xl">
        {/* ========================================================================= */}
        {/* PAGE HEADER                                                               */}
        {/* ========================================================================= */}
        <Paper
          p={{ base: 'md', sm: 'xl' }}
          radius="xl"
          style={{
            background: 'linear-gradient(135deg, rgba(36, 8, 14, 0.95) 0%, rgba(18, 3, 5, 0.95) 100%)',
            border: '2px solid rgba(250, 204, 21, 0.4)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Box>
              <Group gap="xs" align="center">
                <Badge
                  color="royalGold"
                  variant="filled"
                  size="md"
                  className="badge-gold-filled"
                  style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}
                >
                  COMMUNICATIONS & NOTIFICATIONS ENGINE
                </Badge>
                <Badge variant="outline" color="teal" size="md">
                  Active
                </Badge>
              </Group>
              <Title
                order={1}
                className="gold-gradient-text"
                mt={6}
                style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}
              >
                SMS & WhatsApp Message Templates
              </Title>
              <Text size="sm" c="gray.3" mt={4} maw={750}>
                Customize every message dispatched automatically via TextBee SMS or shared via WhatsApp.
                Templates automatically pull active phase voucher values, stall rules, and personal tokens.
              </Text>
            </Box>

            <Group gap="sm">
              <Button
                variant="light"
                color="red"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={handleResetAll}
                loading={saving}
              >
                Reset All Defaults
              </Button>

              <Button
                color="royalGold"
                variant="filled"
                size="sm"
                className="btn-gold-glow"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={() => handleSaveAll()}
                loading={saving}
                style={{ color: '#140305', fontWeight: 700, backgroundColor: '#facc15' }}
              >
                Save All Changes
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* ========================================================================= */}
        {/* QUICK STATS & SYNC BAR                                                    */}
        {/* ========================================================================= */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Paper
            p="md"
            radius="lg"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <Group justify="space-between" align="center">
              <Box>
                <Text size="xs" fw={700} c="royalGold.4">
                  TEXTBEE SMS GATEWAY
                </Text>
                <Text size="sm" fw={800} c="green.3" mt={2}>
                  Connected & Ready
                </Text>
              </Box>
              <ThemeIcon color="green" variant="light" size="lg" radius="md">
                <IconSend size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper
            p="md"
            radius="lg"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <Group justify="space-between" align="center">
              <Box>
                <Text size="xs" fw={700} c="royalGold.4">
                  ACTIVE TICKET PHASE VOUCHER
                </Text>
                <Text size="sm" fw={800} c="yellow.3" mt={2}>
                  ₹{activePhase?.voucherAmount || 100} ({activePhase?.voucherApplicableTo === 'food' ? 'Food Only' : activePhase?.voucherApplicableTo === 'other' ? 'Commercial Only' : 'All 35 Stalls'})
                </Text>
              </Box>
              <ThemeIcon color="royalGold" variant="light" size="lg" radius="md">
                <IconTicket size={20} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper
            p="md"
            radius="lg"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
            }}
          >
            <Group justify="space-between" align="center">
              <Box>
                <Text size="xs" fw={700} c="royalGold.4">
                  AMBASSADOR REWARD TIERS
                </Text>
                <Text size="sm" fw={800} c="teal.3" mt={2}>
                  {tiers.length || 2} Configured Tiers ({ambassadorSameForAll ? 'Unified SMS' : 'Specific Per Tier'})
                </Text>
              </Box>
              <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                <IconCrown size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* ========================================================================= */}
        {/* MAIN NAVIGATION TABS                                                      */}
        {/* ========================================================================= */}
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          color="yellow"
          radius="lg"
          styles={{
            list: {
              gap: '12px',
            },
            tab: {
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px 24px',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              color: '#f3f4f6',
              '&[data-active="true"], &[data-active]': {
                backgroundColor: '#facc15 !important',
                color: '#140305 !important',
                borderColor: '#facc15 !important',
                boxShadow: '0 4px 18px rgba(250, 204, 21, 0.45)',
                fontWeight: 800,
              },
              '&[data-active="true"] svg, &[data-active] svg': {
                color: '#140305 !important',
                stroke: '#140305 !important',
              },
              '&:hover:not([data-active])': {
                backgroundColor: 'rgba(42, 8, 14, 0.95)',
                borderColor: 'rgba(234, 179, 8, 0.5)',
                color: '#ffffff',
              },
            },
          }}
        >
          <Tabs.List mb="lg">
            <Tabs.Tab value="sms" leftSection={<IconDeviceMobile size={18} />}>
              SMS Notifications (Automated Dispatches)
            </Tabs.Tab>
            <Tabs.Tab value="whatsapp" leftSection={<IconBrandWhatsapp size={18} />}>
              WhatsApp Templates (Viral Share & Passes)
            </Tabs.Tab>
          </Tabs.List>

          {/* ========================================================================= */}
          {/* TAB 1: SMS NOTIFICATIONS                                                  */}
          {/* ========================================================================= */}
          <Tabs.Panel value="sms">
            <Stack gap="xl">
              {/* 1. Ticket Pass SMS */}
              {renderTemplateCard('template_ticket_sms')}

              {/* 2. Stall Booking SMS */}
              {renderTemplateCard('template_stall_sms')}

              {/* 3. Ambassador Milestone SMS with Tier Selection */}
              <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="xl"
                style={{
                  backgroundColor: 'rgba(20, 3, 5, 0.9)',
                  border: '2px solid rgba(234, 179, 8, 0.4)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
                    <Box>
                      <Group gap="xs" align="center">
                        <Badge color="royalGold" variant="filled" size="sm" style={{ fontWeight: 800 }}>
                          TEXTBEE SMS
                        </Badge>
                        <Title order={3} size="h4" c="white">
                          Ambassador Reward Milestone SMS
                        </Title>
                      </Group>
                      <Text size="xs" c="gray.4" mt={4}>
                        Dispatched via TextBee when an ambassador unlocks a milestone tier. You can keep one common template or customize specific messages per tier.
                      </Text>
                    </Box>

                    {/* Mode Toggle Switch */}
                    <Paper
                      p="xs"
                      radius="md"
                      style={{
                        backgroundColor: '#0a0102',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                      }}
                    >
                      <Group gap="sm" align="center">
                        <Text size="xs" fw={700} c={ambassadorSameForAll ? 'yellow.3' : 'gray.4'}>
                          Unified for all tiers
                        </Text>
                        <Switch
                          checked={!ambassadorSameForAll}
                          onChange={(e) => {
                            const newMode = !e.currentTarget.checked;
                            setAmbassadorSameForAll(newMode);
                            handleSaveAll({
                              template_ambassador_same_for_all: newMode ? 'true' : 'false',
                            });
                          }}
                          color="royalGold"
                          size="md"
                        />
                        <Text size="xs" fw={700} c={!ambassadorSameForAll ? 'teal.3' : 'gray.4'}>
                          Customize per tier
                        </Text>
                      </Group>
                    </Paper>
                  </Group>

                  {/* Mode A: Unified Template */}
                  {ambassadorSameForAll ? (
                    <Box mt="xs">
                      {renderTemplateCard(
                        'template_ambassador_common_sms',
                        'Unified Ambassador Milestone SMS (Applied to All Tiers)',
                        'This single template dynamically fills in the achieved tier name, referral count, and vouchers.'
                      )}
                    </Box>
                  ) : (
                    /* Mode B: Specific Per-Tier Customization */
                    <Stack gap="md" mt="xs">
                      <Alert
                        icon={<IconInfoCircle size={18} />}
                        color="teal"
                        variant="light"
                        style={{ backgroundColor: 'rgba(20, 184, 166, 0.08)', borderColor: 'rgba(20, 184, 166, 0.3)' }}
                      >
                        <Text size="xs" c="teal.2">
                          <b>Per-Tier Mode Active:</b> You can write specific customized congratulatory text for Tier 1 (Silver), Tier 2 (Gold), and beyond.
                        </Text>
                      </Alert>

                      <SegmentedControl
                        value={selectedAmbassadorTierTab}
                        onChange={setSelectedAmbassadorTierTab}
                        data={[
                          { label: 'Tier 1 - Silver (10 Referrals)', value: 'tier_1' },
                          { label: 'Tier 2 - Gold (25 Referrals)', value: 'tier_2' },
                        ]}
                        color="yellow"
                        radius="md"
                        styles={{
                          root: {
                            backgroundColor: '#0a0102',
                            border: '1px solid rgba(234, 179, 8, 0.35)',
                          },
                          label: {
                            fontWeight: 700,
                            fontSize: '13px',
                            color: '#d1d5db',
                            '&[data-active]': {
                              color: '#140305 !important',
                              fontWeight: 800,
                            },
                          },
                          indicator: {
                            backgroundColor: '#facc15',
                          },
                        }}
                      />

                      {selectedAmbassadorTierTab === 'tier_1' && (
                        renderTemplateCard(
                          'template_ambassador_tier_1_sms',
                          'Tier 1 (Silver Ambassador) Milestone SMS',
                          'Notification sent when an ambassador reaches 10 referrals and unlocks free entry.'
                        )
                      )}

                      {selectedAmbassadorTierTab === 'tier_2' && (
                        renderTemplateCard(
                          'template_ambassador_tier_2_sms',
                          'Tier 2 (Gold Ambassador) Milestone SMS',
                          'Notification sent when an ambassador reaches 25 referrals and unlocks milestone vouchers.'
                        )
                      )}
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* ========================================================================= */}
          {/* TAB 2: WHATSAPP TEMPLATES                                                 */}
          {/* ========================================================================= */}
          <Tabs.Panel value="whatsapp">
            <Stack gap="xl">
              {/* 1. Ambassador Share Template */}
              <Box>
                <Alert
                  icon={<IconSparkles size={18} />}
                  color="teal"
                  variant="light"
                  mb="md"
                  style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', borderColor: 'rgba(13, 148, 136, 0.3)' }}
                >
                  <Text size="xs" c="teal.2">
                    <b>Active Phase Live Sync:</b> This template is sent by ambassadors to prospective attendees.
                    The token <code>{'{{voucher_amount}}'}</code> will automatically reflect the active phase (currently <b>₹{activePhase?.voucherAmount || 100}</b>)
                    and <code>{'{{voucher_usability}}'}</code> will state <b>&quot;{activePhase?.voucherApplicableTo === 'food' ? 'Food Stalls Only (Stalls 1-15)' : activePhase?.voucherApplicableTo === 'other' ? 'Commercial & Shopping Stalls (Stalls A-T)' : 'Valid across all 35 Food & Commercial Stalls'}&quot;</b>.
                  </Text>
                </Alert>
                {renderTemplateCard('template_ambassador_share_wa')}
              </Box>

              {/* 2. Exhibitor Direct Pass WhatsApp */}
              {renderTemplateCard('template_stall_wa')}

              {/* 3. Customer Direct Pass WhatsApp */}
              {renderTemplateCard('template_ticket_wa')}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Bottom Floating / Sticky Save Bar */}
        <Paper
          p="md"
          radius="xl"
          style={{
            backgroundColor: 'rgba(20, 3, 5, 0.95)',
            border: '2px solid rgba(250, 204, 21, 0.5)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)',
            position: 'sticky',
            bottom: 20,
            zIndex: 10,
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                <IconCheck size={14} />
              </ThemeIcon>
              <Text size="xs" c="gray.3" fw={600}>
                All template changes take effect instantly across live SMS dispatches and WhatsApp shares.
              </Text>
            </Group>

            <Button
              color="royalGold"
              variant="filled"
              size="sm"
              className="btn-gold-glow"
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={() => handleSaveAll()}
              loading={saving}
              style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}
            >
              Save All Templates
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  Box,
  Button,
  Badge,
  Avatar,
  Stack,
  Divider,
  Paper,
  Loader,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingStore,
  IconReceipt,
  IconPhoto,
  IconSettings,
  IconKey,
  IconLogout,
  IconExternalLink,
  IconSparkles,
  IconUsers,
  IconTicket,
  IconMessageCircle,
  IconCalendarEvent,
  IconCrown,
  IconDiscount2,
} from '@tabler/icons-react';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);

  // If on login page, render children directly without admin shell
  const isLoginPage = pathname === '/admin/login';
  const [loadingAuth, setLoadingAuth] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setLoadingAuth(false);
      return;
    }

    let isMounted = true;
    const timeout = setTimeout(() => {
      if (isMounted) {
        window.location.replace('/admin/login');
      }
    }, 3000);

    fetch('/api/admin/auth/me', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        clearTimeout(timeout);
        if (data.success && data.authenticated && data.admin) {
          setAdminUser(data.admin);
          setLoadingAuth(false);
        } else {
          window.location.replace('/admin/login');
        }
      })
      .catch(() => {
        if (isMounted) {
          clearTimeout(timeout);
          window.location.replace('/admin/login');
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [pathname, isLoginPage]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      notifications.show({
        title: 'Logged Out',
        message: 'Admin session closed securely.',
        color: 'yellow',
      });
      window.location.href = '/admin/login';
    } catch (err) {
      window.location.href = '/admin/login';
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loadingAuth) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          backgroundColor: '#0d0204',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack align="center" gap="sm">
          <Loader color="royalGold" size="lg" />
          <Text size="xs" c="gray.5" fw={600} style={{ letterSpacing: '0.05em' }}>
            AUTHENTICATING ADMIN ACCESS...
          </Text>
        </Stack>
      </Box>
    );
  }

  const ticketNavLinks = [
    { label: 'Customer Ticket Bookings', href: '/admin/ticket-bookings', icon: IconTicket },
    { label: 'Phases & Pricing Rules', href: '/admin/ticket-phases', icon: IconCalendarEvent },
    { label: 'Discount Coupons', href: '/admin/coupons', icon: IconDiscount2 },
    { label: 'Stall Voucher Settlements', href: '/admin/stall-vouchers', icon: IconBuildingStore },
    { label: 'Campus Ambassadors', href: '/admin/ambassadors', icon: IconCrown },
  ];

  const stallNavLinks = [
    { label: 'Stalls & Live Layout', href: '/admin/stalls', icon: IconBuildingStore },
    { label: 'Stall Bookings & Orders', href: '/admin/bookings', icon: IconReceipt },
    { label: 'Received Inquiries', href: '/admin/inquiries', icon: IconMessageCircle },
    { label: 'Carousel & Media', href: '/admin/media', icon: IconPhoto },
  ];

  const adminNavLinks = [
    { label: 'Team & Verifier Users', href: '/admin/users', icon: IconUsers },
    { label: 'Site & Event Settings', href: '/admin/settings', icon: IconSettings },
    { label: 'Change Password', href: '/admin/security', icon: IconKey },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#0d0204',
          minHeight: '100vh',
        },
        header: {
          backgroundColor: '#140305',
          borderBottom: '1px solid rgba(234, 179, 8, 0.25)',
        },
        navbar: {
          backgroundColor: '#140305',
          borderRight: '1px solid rgba(234, 179, 8, 0.2)',
        },
      }}
    >
      <AppShell.Header p="xs">
        <Group justify="space-between" align="center" h="100%" px={{ base: 'xs', sm: 'md' }} wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 1, minWidth: 0 }}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#facc15" />
            <Link href="/admin/ticket-bookings" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Group gap="xs" align="center" wrap="nowrap">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(234, 179, 8, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    backgroundColor: '#140305',
                  }}
                >
                  <Image
                    src="/icon1.png"
                    alt="Asha Bani Logo"
                    fill
                    sizes="32px"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
                <Text fw={800} size="sm" className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif", whiteSpace: 'nowrap' }}>
                  ADMIN CONSOLE
                </Text>
              </Group>
            </Link>
          </Group>

          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            <Button
              onClick={handleLogout}
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconLogout size={14} />}
              style={{ whiteSpace: 'nowrap' }}
            >
              Sign Out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="xs"
        style={{
          backgroundColor: '#140305',
          borderRight: '1px solid rgba(234, 179, 8, 0.2)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <AppShell.Section grow component={ScrollArea} scrollbars="y" style={{ height: '100%' }}>
          <Stack gap="xs" style={{ flexGrow: 1, width: '100%', paddingBottom: 60 }} align="stretch">
            {/* Admin Profile Chip */}
            <Paper
              p="xs"
              mb="xs"
              radius="md"
              w="100%"
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                boxSizing: 'border-box',
              }}
            >
              <Group gap="xs" wrap="nowrap">
                <Avatar color="royalGold" radius="xl" size="sm" style={{ flexShrink: 0 }}>
                  A
                </Avatar>
                <Box style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <Text size="xs" fw={700} c="white" lineClamp={1}>
                    {adminUser?.name || 'Administrator'}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {adminUser?.email || ''}
                  </Text>
                </Box>
              </Group>
            </Paper>

            {/* TICKETING & REGISTRATIONS */}
            <Box w="100%">
              <Text size="xs" fw={700} c="royalGold.4" px={8} mb={6} style={{ letterSpacing: '0.08em' }}>
                TICKETING &amp; PASSES
              </Text>
              {ticketNavLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.href}
                    component={Link}
                    href={link.href}
                    label={link.label}
                    leftSection={<Icon size={18} color={active ? '#2a080c' : '#facc15'} style={{ flexShrink: 0 }} />}
                    active={active}
                    onClick={close}
                    styles={{
                      root: {
                        width: '100%',
                        boxSizing: 'border-box',
                        borderRadius: 8,
                        padding: '10px 12px',
                        marginBottom: 4,
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? '#facc15' : 'transparent',
                        color: active ? '#2a080c !important' : '#f8fafc',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: active ? '#facc15' : 'rgba(234, 179, 8, 0.12)',
                        },
                      },
                      body: {
                        minWidth: 0,
                        flex: 1,
                      },
                      label: {
                        color: active ? '#2a080c' : '#f8fafc',
                        fontSize: '0.88rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                );
              })}
            </Box>

            <Divider my="xs" color="rgba(234, 179, 8, 0.15)" w="100%" />

            {/* EXHIBITORS & STALLS */}
            <Box w="100%">
              <Text size="xs" fw={700} c="royalGold.4" px={8} mb={6} style={{ letterSpacing: '0.08em' }}>
                EXHIBITORS &amp; STALLS
              </Text>
              {stallNavLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.href}
                    component={Link}
                    href={link.href}
                    label={link.label}
                    leftSection={<Icon size={18} color={active ? '#2a080c' : '#facc15'} style={{ flexShrink: 0 }} />}
                    active={active}
                    onClick={close}
                    styles={{
                      root: {
                        width: '100%',
                        boxSizing: 'border-box',
                        borderRadius: 8,
                        padding: '10px 12px',
                        marginBottom: 4,
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? '#facc15' : 'transparent',
                        color: active ? '#2a080c !important' : '#f8fafc',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: active ? '#facc15' : 'rgba(234, 179, 8, 0.12)',
                        },
                      },
                      body: {
                        minWidth: 0,
                        flex: 1,
                      },
                      label: {
                        color: active ? '#2a080c' : '#f8fafc',
                        fontSize: '0.88rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                );
              })}
            </Box>

            <Divider my="xs" color="rgba(234, 179, 8, 0.15)" w="100%" />

            {/* ADMINISTRATION SECTION */}
            <Box w="100%">
              <Text size="xs" fw={700} c="royalGold.4" px={8} mb={6} style={{ letterSpacing: '0.08em' }}>
                ADMINISTRATION
              </Text>
              {adminNavLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.href}
                    component={Link}
                    href={link.href}
                    label={link.label}
                    leftSection={<Icon size={18} color={active ? '#2a080c' : '#facc15'} style={{ flexShrink: 0 }} />}
                    active={active}
                    onClick={close}
                    styles={{
                      root: {
                        width: '100%',
                        boxSizing: 'border-box',
                        borderRadius: 8,
                        padding: '10px 12px',
                        marginBottom: 4,
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? '#facc15' : 'transparent',
                        color: active ? '#2a080c !important' : '#f8fafc',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: active ? '#facc15' : 'rgba(234, 179, 8, 0.12)',
                        },
                      },
                      body: {
                        minWidth: 0,
                        flex: 1,
                      },
                      label: {
                        color: active ? '#2a080c' : '#f8fafc',
                        fontSize: '0.88rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                );
              })}
            </Box>

            <Divider my="xs" color="rgba(234, 179, 8, 0.15)" w="100%" />

            {/* SIDEBAR LOGOUT */}
            <Box w="100%">
              <Button
                onClick={handleLogout}
                variant="subtle"
                color="red"
                fullWidth
                justify="flex-start"
                leftSection={<IconLogout size={18} />}
                styles={{
                  root: {
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontWeight: 600,
                    color: '#f87171',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    },
                  },
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default AdminLayoutWrapper;

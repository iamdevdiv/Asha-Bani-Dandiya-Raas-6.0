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

  useEffect(() => {
    if (!isLoginPage) {
      fetch('/api/admin/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAdminUser(data.admin);
          } else {
            router.push('/admin/login');
          }
        })
        .catch(() => {
          router.push('/admin/login');
        });
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      notifications.show({
        title: 'Logged Out',
        message: 'You have been safely signed out.',
        color: 'yellow',
      });
      router.push('/admin/login');
    } catch (err) {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const stallNavLinks = [
    { label: 'Stalls & Live Layout', href: '/admin/stalls', icon: IconBuildingStore },
    { label: 'Bookings & Orders', href: '/admin/bookings', icon: IconReceipt },
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
        <Group justify="space-between" h="100%" px="md">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#facc15" />
            <Link href="/admin/stalls" style={{ textDecoration: 'none' }}>
              <Group gap="xs" align="center">
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

          <Group gap="sm">
            <Button
              onClick={handleLogout}
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconLogout size={14} />}
            >
              Sign Out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Stack gap="xs" style={{ flexGrow: 1, width: '100%' }} align="stretch">
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
                  {adminUser?.email || 'admin@ashabani.com'}
                </Text>
              </Box>
            </Group>
          </Paper>

          {/* STALL MANAGEMENT SECTION */}
          <Box w="100%" mt={4}>
            <Text size="xs" fw={700} c="royalGold.4" px={8} mb={6} style={{ letterSpacing: '0.08em' }}>
              STALL MANAGEMENT
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
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

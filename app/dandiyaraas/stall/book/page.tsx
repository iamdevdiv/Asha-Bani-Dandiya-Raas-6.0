'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import {
  Container,
  Box,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  TextInput,
  SimpleGrid,
  Grid,
  Badge,
  Alert,
  Loader,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingStore,
  IconCheck,
  IconCreditCard,
  IconInfoCircle,
  IconPhone,
  IconUser,
  IconMail,
  IconUsers,
  IconTag,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InteractiveStallGrid, StallItem } from '@/components/InteractiveStallGrid';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function StallBookingPage() {
  const router = useRouter();
  const [stalls, setStalls] = useState<StallItem[]>([]);
  const [selectedStall, setSelectedStall] = useState<StallItem | null>(null);
  const [loadingStalls, setLoadingStalls] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      bookerName: '',
      mobile: '',
      brandName: '',
      stallType: '',
      teamMember1: '',
      teamMember2: '',
      email: '',
    },
    validate: {
      bookerName: (val) => (val.trim().length >= 2 ? null : 'Please enter contact person name'),
      mobile: (val) => (/^[6-9]\d{9}$/.test(val.trim()) ? null : 'Please enter a valid 10-digit Indian mobile number'),
      brandName: (val) => (val.trim().length >= 2 ? null : 'Please enter your brand or business name'),
      stallType: (val) => (val.trim().length >= 2 ? null : 'Please specify stall category'),
      teamMember1: (val) => (val.trim().length >= 2 ? null : 'Please enter Team Member 1 Name'),
      teamMember2: (val) => (val.trim().length >= 2 ? null : 'Please enter Team Member 2 Name'),
      email: (val) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Please enter a valid email address'),
    },
  });

  const fetchStalls = async () => {
    try {
      const res = await fetch('/api/stalls');
      const data = await res.json();
      if (data.success) {
        setStalls(data.stalls);
      }
    } catch (err) {
      console.error('Failed to load stalls:', err);
    } finally {
      setLoadingStalls(false);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  const handleSelectStall = (stall: StallItem) => {
    if (stall.isBooked) {
      notifications.show({
        title: 'Stall Already Booked',
        message: `Stall ${stall.stallNumber} is already reserved. Please pick another canopy.`,
        color: 'red',
      });
      return;
    }
    setSelectedStall(stall);
    notifications.show({
      title: `Stall ${stall.stallNumber} Selected`,
      message: `Price: ₹${stall.price.toLocaleString('en-IN')}. Please fill in the registration details below.`,
      color: 'yellow',
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!selectedStall) {
      notifications.show({
        title: 'Select a Stall',
        message: 'Please tap and select a stall from the interactive map above before submitting.',
        color: 'red',
      });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order on server
      const combinedTeam = `${values.teamMember1} & ${values.teamMember2}`;
      const orderRes = await fetch('/api/stalls/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stallNumber: selectedStall.stallNumber,
          bookerName: values.bookerName,
          brandName: values.brandName,
          email: values.email,
          mobile: values.mobile,
          stallType: values.stallType,
          teamMembers: combinedTeam,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create booking order.');
      }

      const { bookingId, orderId, amount, keyId, isMock } = orderData;

      // 2. Open Razorpay Checkout
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: keyId,
          amount: amount * 100,
          currency: 'INR',
          name: 'Asha Bani Dandiya Raas 6.0',
          description: `Stall ${selectedStall.stallNumber} Reservation (${values.brandName})`,
          image: '/icon1.png',
          order_id: orderId.startsWith('order_mock_') ? undefined : orderId,
          prefill: {
            name: values.bookerName,
            email: values.email,
            contact: values.mobile,
          },
          theme: {
            color: '#ca8a04',
          },
          handler: async function (response: any) {
            await verifyPayment({
              bookingId,
              razorpayOrderId: response.razorpay_order_id || orderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpaySignature: response.razorpay_signature || 'sig_verified',
            });
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              notifications.show({
                title: 'Payment Incomplete',
                message: 'You closed the payment popup before finishing. Your stall is not yet confirmed.',
                color: 'orange',
              });
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback if script is loading or running in test mode
        await verifyPayment({
          bookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'sig_test_valid',
        });
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      notifications.show({
        title: 'Reservation Error',
        message: err.message || 'Something went wrong. Please try again.',
        color: 'red',
      });
      setSubmitting(false);
    }
  };

  const verifyPayment = async (payload: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    try {
      const res = await fetch('/api/stalls/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: 'Booking Confirmed!',
          message: `Stall ${selectedStall?.stallNumber} successfully reserved. Redirecting to your official pass...`,
          color: 'green',
        });
        router.push(`/dandiyaraas/stall/success?bookingId=${payload.bookingId}`);
      } else {
        throw new Error(data.message || 'Payment verification failed.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      notifications.show({
        title: 'Payment Verification Error',
        message: err.message || 'Could not verify payment. Contact support.',
        color: 'red',
      });
      setSubmitting(false);
    }
  };

  return (
    <Box className="festive-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <Container size="xl" py={40}>
        <Stack align="center" gap="xs" mb={35} ta="center">
          <Badge color="royalGold" size="lg" variant="filled" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
            OFFICIAL STALL ALLOTMENT PORTAL
          </Badge>
          <Title
            order={1}
            className="gold-gradient-text"
            style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)' }}
          >
            Select Your Stall &amp; Register
          </Title>
          <Text size="md" c="gray.3" maw={700}>
            Tap any available canopy booth on the layout to select your location, then fill in your brand details to complete secure payment.
          </Text>
        </Stack>

        <Grid gap="xl" align="start">
          {/* Left Column: Interactive Map (7 cols on lg) */}
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Paper
              p="lg"
              radius="lg"
              style={{
                backgroundColor: 'rgba(20, 3, 5, 0.75)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              <Group justify="space-between" align="center" mb="md">
                <Box>
                  <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Canopy Booth Layout
                  </Title>
                  <Text size="xs" c="gray.4">
                    Reference Map (Food 1–15, Commercial A–T)
                  </Text>
                </Box>

                {selectedStall && (
                  <Badge color="yellow" size="lg" variant="filled" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
                    Selected: Stall {selectedStall.stallNumber} (₹{selectedStall.price.toLocaleString('en-IN')})
                  </Badge>
                )}
              </Group>

              {loadingStalls ? (
                <Stack align="center" py={50}>
                  <Loader color="royalGold" size="md" />
                  <Text size="sm" c="gray.4">
                    Loading live stall availability...
                  </Text>
                </Stack>
              ) : (
                <InteractiveStallGrid
                  stalls={stalls}
                  selectedStallNumber={selectedStall?.stallNumber}
                  onSelectStall={handleSelectStall}
                />
              )}
            </Paper>
          </Grid.Col>

          {/* Right Column: Registration Form & Pricing Summary (5 cols on lg) */}
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Paper
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(36, 8, 14, 0.8)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            >
              <Title order={3} size="h4" c="white" mb="sm" style={{ fontFamily: "'Cinzel', serif" }}>
                Exhibitor Registration
              </Title>

              {/* Selected Stall Banner */}
              {selectedStall ? (
                <Paper
                  p="sm"
                  mb="md"
                  radius="md"
                  style={{
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                  }}
                >
                  <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="xs" fw={700} c="royalGold.3">
                        SELECTED CANOPY BOOTH
                      </Text>
                      <Text fw={800} size="md" c="white" style={{ wordBreak: 'break-word' }}>
                        Stall {selectedStall.stallNumber} ({selectedStall.section.replace('_', ' ').toUpperCase()})
                      </Text>
                    </Box>
                    <Title order={3} c="yellow.2" style={{ fontFamily: "'Cinzel', serif", flexShrink: 0 }}>
                      ₹{selectedStall.price.toLocaleString('en-IN')}
                    </Title>
                  </Group>
                </Paper>
              ) : (
                <Alert
                  icon={<IconInfoCircle size={18} />}
                  title="No Stall Selected"
                  color="yellow"
                  variant="light"
                  mb="md"
                >
                  Please click an available stall on the layout map to proceed.
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="sm">
                  <TextInput
                    label="Booker / Contact Person Name"
                    placeholder="Enter full name"
                    required
                    leftSection={<IconUser size={16} color="#facc15" />}
                    {...form.getInputProps('bookerName')}
                  />

                  <TextInput
                    label="Mobile Number (10 Digits)"
                    placeholder="Enter 10-digit mobile number"
                    required
                    maxLength={10}
                    leftSection={<IconPhone size={16} color="#facc15" />}
                    value={form.values.mobile}
                    onChange={(e) => {
                      const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                      form.setFieldValue('mobile', val);
                    }}
                    error={form.errors.mobile}
                  />

                  <TextInput
                    label="Brand / Business Name"
                    placeholder="Enter brand or business name"
                    required
                    leftSection={<IconBuildingStore size={16} color="#facc15" />}
                    {...form.getInputProps('brandName')}
                  />

                  <TextInput
                    label="Type of Stall / Products"
                    placeholder="Enter stall category (Food, Apparel, Handicrafts, etc.)"
                    required
                    leftSection={<IconTag size={16} color="#facc15" />}
                    {...form.getInputProps('stallType')}
                  />

                  {/* Team Members Strictly 2 */}
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                    <TextInput
                      label="Member 1 Name (Lead)"
                      placeholder="Enter lead member full name"
                      required
                      leftSection={<IconUser size={15} color="#facc15" />}
                      {...form.getInputProps('teamMember1')}
                    />
                    <TextInput
                      label="Member 2 Name (Assistant)"
                      placeholder="Enter assistant full name"
                      required
                      leftSection={<IconUser size={15} color="#facc15" />}
                      {...form.getInputProps('teamMember2')}
                    />
                  </SimpleGrid>

                  <Text size="xs" c="yellow.2" style={{ fontSize: '0.73rem', lineHeight: 1.4 }}>
                    ℹ️ Each allotment strictly includes 2 exhibitor passes. For additional team passes, contact helpline at <strong>+91 6399063455</strong>.
                  </Text>

                  <TextInput
                    label="Email Address"
                    placeholder="Enter business email address"
                    required
                    type="email"
                    leftSection={<IconMail size={16} color="#facc15" />}
                    {...form.getInputProps('email')}
                  />

                  {/* Summary & Inclusions */}
                  <Box mt="xs" p="sm" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                    <Text size="xs" fw={700} c="royalGold.4" mb={4}>
                      ALLOTMENT INCLUDES:
                    </Text>
                    <Text size="xs" c="gray.3">
                      • 2 Display Tables + 1 Allocated Space Block
                    </Text>
                    <Text size="xs" c="gray.3">
                      • 2 Official Passes in Brand Name
                    </Text>
                    <Text size="xs" c="gray.3">
                      • On-Ground Media &amp; Host Shoutouts
                    </Text>
                    <Text size="xs" c="red.3" mt={4}>
                      • Strict non-refundable terms apply after reservation
                    </Text>
                  </Box>

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    mt="sm"
                    className="btn-auspicious-gold"
                    loading={submitting}
                    disabled={!selectedStall}
                    leftSection={<IconCreditCard size={20} />}
                  >
                    {selectedStall
                      ? `Pay ₹${selectedStall.price.toLocaleString('en-IN')} & Confirm Stall`
                      : 'Select a Stall Above'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Textarea,
  Badge,
  Divider,
  ActionIcon,
  Alert,
  Loader,
  Center,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconTicket,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconShieldCheck,
  IconSparkles,
  IconBuildingStore,
  IconArrowLeft,
  IconDiscount2,
  IconCheck,
  IconX,
  IconCreditCard,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TicketPurchasePage() {
  const router = useRouter();
  const [loadingPhase, setLoadingPhase] = useState(true);
  const [phase, setPhase] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [children, setChildren] = useState<string[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    isFreePass: boolean;
    message: string;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Fetch active phase
    fetch('/api/tickets/phases')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.currentActive) {
          setPhase(data.currentActive);
        }
      })
      .catch((err) => console.warn('Could not fetch phases:', err))
      .finally(() => setLoadingPhase(false));

    // 2. Fetch settings (for max children and child height threshold)
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.warn('Could not fetch settings:', err));
  }, []);

  const maxChildren = parseInt(settings.max_children_per_ticket || '3', 10);
  const childHeightLimit = parseInt(settings.child_height_limit_inches || '55', 10);

  const adultPrice = phase?.adultPrice ?? 499;
  const childPrice = phase?.childPrice ?? 199;
  const voucherAmount = phase?.voucherAmount ?? 100;
  const baseTotal = adultPrice + childPrice * children.length;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayable = Math.max(0, baseTotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      notifications.show({
        title: 'Enter Coupon Code',
        message: 'Please enter a coupon code.',
        color: 'yellow',
      });
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), amount: baseTotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
          isFreePass: data.isFreePass,
          message: data.message,
        });
        notifications.show({
          title: 'Coupon Applied!',
          message: data.message,
          color: 'green',
        });
      } else {
        setAppliedCoupon(null);
        notifications.show({
          title: 'Invalid Coupon',
          message: data.message || 'Coupon code is invalid or expired.',
          color: 'red',
        });
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      notifications.show({
        title: 'Validation Failed',
        message: 'Could not validate coupon code. Please try again.',
        color: 'red',
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    notifications.show({
      title: 'Coupon Removed',
      message: 'Coupon code has been removed.',
      color: 'gray',
    });
  };

  const handleAddChild = () => {
    if (children.length < maxChildren) {
      setChildren([...children, '']);
    } else {
      notifications.show({
        title: 'Limit Reached',
        message: `Maximum ${maxChildren} children allowed per ticket.`,
        color: 'yellow',
      });
    }
  };

  const handleRemoveChild = (index: number) => {
    const updated = children.filter((_, i) => i !== index);
    setChildren(updated);
    // Clear child-specific errors
    const newErrors = { ...errors };
    delete newErrors[`child_${index}`];
    setErrors(newErrors);
  };

  const handleChildNameChange = (index: number, value: string) => {
    const updated = [...children];
    updated[index] = value;
    setChildren(updated);
    if (errors[`child_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`child_${index}`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number (starts with 6-9)';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Enter a valid email address';
      }
    }

    if (!address.trim()) {
      newErrors.address = 'Residential Address / Locality is required';
    }

    children.forEach((child, idx) => {
      if (!child.trim()) {
        newErrors[`child_${idx}`] = `Please enter name for Child ${idx + 1}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Incomplete Form',
        message: 'Please complete all required fields correctly.',
        color: 'red',
      });
      return;
    }

    setSubmitting(true);
    try {
      const refCode = typeof window !== 'undefined' ? localStorage.getItem('asha_ref') || undefined : undefined;

      // 1. Create order
      const orderRes = await fetch('/api/tickets/book/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          mobile,
          email: email.trim() || undefined,
          address,
          childrenNames: children.map((c) => c.trim()).filter(Boolean),
          ref: refCode,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize ticket booking order');
      }

      // 2. 100% Free Pass or Free Coupon Bypass Triggered
      if ((orderData.bypass || orderData.isFreePass) && orderData.passUrl) {
        notifications.show({
          title: 'Pass Issued Successfully',
          message: 'Your 100% free pass has been issued! Redirecting to your pass...',
          color: 'green',
        });
        router.push(orderData.passUrl);
        return;
      }

      // 3. Mock mode for local testing without active Razorpay keys
      if (orderData.isMock || !window.Razorpay) {
        const verifyRes = await fetch('/api/tickets/book/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: orderData.bookingId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_signature_verified',
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success && verifyData.booking) {
          notifications.show({
            title: 'Payment Confirmed',
            message: 'Your ticket pass has been generated successfully!',
            color: 'green',
          });
          router.push(`/dandiyaraas/tickets/pass/${verifyData.booking.id}`);
        } else {
          throw new Error(verifyData.message || 'Payment verification failed');
        }
        return;
      }

      // 4. Live Razorpay Modal
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Asha Bani Dandiya Raas 6.0',
        description: `Pass Booking #${orderData.bookingNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: fullName,
          email: email.trim() || undefined,
          contact: mobile,
        },
        theme: {
          color: '#eab308',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/tickets/book/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: orderData.bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.booking) {
              notifications.show({
                title: 'Pass Issued Successfully',
                message: 'Payment confirmed! Redirecting to your entry pass...',
                color: 'green',
              });
              router.push(`/dandiyaraas/tickets/pass/${verifyData.booking.id}`);
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (err: any) {
            notifications.show({
              title: 'Verification Failed',
              message: err.message || 'Payment verification failed. Please contact organizers.',
              color: 'red',
            });
          }
        },
        modal: {
          ondismiss: function () {
            notifications.show({
              title: 'Payment Incomplete',
              message: 'Payment window was closed before completing transaction.',
              color: 'yellow',
            });
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        notifications.show({
          title: 'Payment Failed',
          message: resp.error?.description || 'Payment was unsuccessful. Please try again.',
          color: 'red',
        });
        setSubmitting(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error('Ticket checkout error:', error);
      notifications.show({
        title: 'Booking Error',
        message: error.message || 'Failed to initiate ticket purchase. Please try again.',
        color: 'red',
      });
      setSubmitting(false);
    }
  };

  if (loadingPhase) {
    return (
      <Box className="festive-background" style={{ minHeight: '100vh' }}>
        <Navbar />
        <Container size="sm" py={100}>
          <Center>
            <Stack align="center" gap="md">
              <Loader color="royalGold" size="xl" />
              <Text size="sm" c="gray.4">
                Loading official pass options...
              </Text>
            </Stack>
          </Center>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <Container size="sm" py={{ base: 30, sm: 50 }} style={{ flexGrow: 1 }}>
        <Stack gap="xl">
          {/* Top Back Nav & Badge */}
          <Group justify="space-between" align="center">
            <Button
              component={Link}
              href="/dandiyaraas"
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              size="xs"
            >
              Back to Event
            </Button>
            <Badge color="royalGold" variant="filled" size="md" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
              OFFICIAL ENTRY PASSES
            </Badge>
          </Group>

          {/* Header Title */}
          <Box ta="center">
            <Text size="xs" fw={700} c="royalGold.4" style={{ letterSpacing: '0.15em' }}>
              ASHA BANI DANDIYA RAAS 6.0
            </Text>
            <Title
              order={1}
              className="gold-gradient-text"
              mt={4}
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
            >
              Book Your Festival Passes
            </Title>
            <Text size="sm" c="gray.4" mt={6} maw={550} mx="auto">
              Experience the grandest night of Garba, high-energy live orchestra, and delicious food stalls.
            </Text>
          </Box>

          {/* Active Phase Banner */}
          <Paper
            p="md"
            radius="lg"
            style={{
              backgroundColor: 'rgba(36, 8, 14, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Box>
                <Group gap="xs">
                  <Badge color="yellow" variant="filled" size="sm" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
                    {phase?.name || 'Phase 1 - Early Bird'}
                  </Badge>
                  <Badge color="green" variant="light" size="sm">
                    ACTIVE PRICING
                  </Badge>
                </Group>
                <Text size="xs" c="gray.3" mt={4}>
                  Valid from {phase?.startDate} to {phase?.endDate}
                </Text>
              </Box>

              <Group gap="md">
                <Box ta="right">
                  <Text size="xs" c="gray.4">
                    Adult Entry Pass
                  </Text>
                  <Text size="lg" fw={800} c="royalGold.3">
                    ₹{adultPrice}
                  </Text>
                </Box>
                <Box ta="right">
                  <Text size="xs" c="gray.4">
                    Child Pass
                  </Text>
                  <Text size="lg" fw={800} c="royalGold.3">
                    ₹{childPrice}
                  </Text>
                </Box>
              </Group>
            </Group>
          </Paper>

          {/* Booking Form Card */}
          <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="xl"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Stack gap="lg">
              {/* Attendee Info */}
              <Title order={2} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                1. Attendee Contact Details
              </Title>

              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.currentTarget.value)}
                error={errors.fullName}
                leftSection={<IconUser size={16} />}
              />

              <Group grow align="flex-start">
                <TextInput
                  label="10-Digit Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => {
                    const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(val);
                    if (errors.mobile) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.mobile;
                        return next;
                      });
                    }
                  }}
                  error={errors.mobile}
                  leftSection={<IconPhone size={16} />}
                />

                <TextInput
                  label="Email Address (Optional)"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  error={errors.email}
                  leftSection={<IconMail size={16} />}
                />
              </Group>

              <Textarea
                label="Residential Address"
                placeholder="Enter your city / locality address"
                required
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                error={errors.address}
                rows={2}
              />

              <Divider my="sm" color="rgba(234, 179, 8, 0.2)" />

              {/* Children Section */}
              <Box>
                <Group justify="space-between" align="center" mb="xs">
                  <Box>
                    <Title order={2} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                      2. Add Accompanying Children (Optional)
                    </Title>
                    <Text size="xs" c="gray.4" mt={2}>
                      ₹{childPrice} per child pass. Maximum {maxChildren} children allowed per ticket.
                    </Text>
                  </Box>

                  {children.length < maxChildren && (
                    <Button
                      size="xs"
                      variant="light"
                      color="royalGold"
                      onClick={handleAddChild}
                      leftSection={<IconPlus size={14} />}
                    >
                      + Add Child ({children.length}/{maxChildren})
                    </Button>
                  )}
                </Group>

                {/* Child Height Rule Notice */}
                <Alert
                  icon={<IconInfoCircle size={18} />}
                  color="yellow"
                  radius="md"
                  variant="light"
                  mb="md"
                >
                  <Text size="xs" fw={600} c="yellow.2">
                    Height Verification Notice: Children must be strictly <b>below {childHeightLimit} inches (4&apos;7&quot;)</b> in height to qualify for child passes. Height measurement is verified at the entry gate.
                  </Text>
                </Alert>

                {/* Children Input Rows */}
                {children.length > 0 && (
                  <Stack gap="xs">
                    {children.map((childName, idx) => (
                      <Group key={idx} align="flex-start" wrap="nowrap">
                        <TextInput
                          label={`Child ${idx + 1} Full Name`}
                          placeholder={`Enter child ${idx + 1}'s full name`}
                          required
                          value={childName}
                          onChange={(e) => handleChildNameChange(idx, e.currentTarget.value)}
                          error={errors[`child_${idx}`]}
                          style={{ flexGrow: 1 }}
                        />
                        <ActionIcon
                          color="red"
                          variant="light"
                          size="lg"
                          radius="md"
                          mt={25}
                          onClick={() => handleRemoveChild(idx)}
                          title="Remove Child"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider my="sm" color="rgba(234, 179, 8, 0.2)" />

              {/* Free Stall Voucher Notice */}
              <Paper
                p="md"
                radius="md"
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px dashed rgba(250, 204, 21, 0.4)',
                }}
              >
                <Group gap="sm" align="center">
                  <ThemeIcon size={36} radius="md" color="yellow" variant="filled">
                    <IconBuildingStore size={20} color="#140305" />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" fw={700} c="royalGold.3">
                      SPECIAL FESTIVE PERK INCLUDED
                    </Text>
                    <Text size="sm" c="gray.2">
                      Your ticket includes a <b>₹{voucherAmount} Stall Voucher</b> valid at{' '}
                      <b style={{ color: '#facc15' }}>
                        {phase?.voucherApplicableTo === 'food'
                          ? 'Food Stalls Only (Stalls 1–15)'
                          : phase?.voucherApplicableTo === 'other'
                            ? 'Commercial & Shopping Stalls (Stalls A–T)'
                            : 'All 35 Stalls (Food + Commercial)'}
                      </b>!
                    </Text>
                  </Box>
                </Group>
              </Paper>

              {/* Coupon / Promo Code Section */}
              <Box>
                {!showCouponInput && !appliedCoupon ? (
                  <Group justify="flex-end">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="yellow"
                      leftSection={<IconDiscount2 size={15} />}
                      onClick={() => setShowCouponInput(true)}
                      style={{ fontSize: 12, fontWeight: 600 }}
                    >
                      Have a Coupon / Promo Code?
                    </Button>
                  </Group>
                ) : (
                  <Paper
                    p="sm"
                    radius="md"
                    style={{
                      backgroundColor: 'rgba(234, 179, 8, 0.05)',
                      border: '1px dashed rgba(234, 179, 8, 0.35)',
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between" align="center">
                        <Group gap={6}>
                          <IconDiscount2 size={16} color="#facc15" />
                          <Text size="xs" fw={700} c="royalGold.3">
                            COUPON / PROMO CODE
                          </Text>
                        </Group>
                        {!appliedCoupon && (
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color="gray"
                            onClick={() => setShowCouponInput(false)}
                            title="Close"
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        )}
                      </Group>

                      {!appliedCoupon ? (
                        <Group gap="xs" align="center">
                          <TextInput
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.currentTarget.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyCoupon();
                              }
                            }}
                            size="sm"
                            style={{ flex: 1 }}
                            styles={{
                              input: {
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderColor: 'rgba(234, 179, 8, 0.3)',
                                color: '#fef08a',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                fontFamily: 'monospace',
                              },
                            }}
                          />
                          <Button
                            size="sm"
                            className="btn-auspicious-gold"
                            loading={validatingCoupon}
                            onClick={handleApplyCoupon}
                          >
                            Apply
                          </Button>
                        </Group>
                      ) : (
                        <Group justify="space-between" align="center" wrap="wrap">
                          <Group gap="xs">
                            <Badge color="green" variant="filled" size="md">
                              ✓ {appliedCoupon.code}
                            </Badge>
                            <Text size="xs" c="green.3" fw={600}>
                              {appliedCoupon.message}
                            </Text>
                          </Group>
                          <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            onClick={handleRemoveCoupon}
                          >
                            Remove
                          </Button>
                        </Group>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Box>

              {/* Price Calculation Summary */}
              <Paper
                p="lg"
                radius="lg"
                style={{
                  backgroundColor: '#120204',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="gray.4">
                      Adult Pass (1 Attendee):
                    </Text>
                    <Text size="sm" fw={600} c="white">
                      ₹{adultPrice}
                    </Text>
                  </Group>

                  {children.length > 0 && (
                    <Group justify="space-between">
                      <Text size="sm" c="gray.4">
                        Child Pass ({children.length} {children.length === 1 ? 'Child' : 'Children'} @ ₹{childPrice}):
                      </Text>
                      <Text size="sm" fw={600} c="white">
                        ₹{childPrice * children.length}
                      </Text>
                    </Group>
                  )}

                  {discountAmount > 0 && (
                    <Group justify="space-between">
                      <Text size="sm" c="green.4" fw={600}>
                        Coupon Discount ({appliedCoupon?.code}):
                      </Text>
                      <Text size="sm" fw={700} c="green.4">
                        -₹{discountAmount}
                      </Text>
                    </Group>
                  )}

                  <Divider my={4} color="rgba(255,255,255,0.1)" />

                  <Group justify="space-between">
                    <Text size="md" fw={700} c="white">
                      Total Payable Amount:
                    </Text>
                    <Text size="xl" fw={900} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
                      {discountAmount > 0 ? (
                        <span>
                          <s style={{ fontSize: '1rem', color: '#9ca3af', marginRight: 8 }}>₹{baseTotal}</s>
                          <span style={{ color: finalPayable === 0 ? '#4ade80' : '#facc15' }}>
                            ₹{finalPayable} {finalPayable === 0 ? '(100% Free)' : ''}
                          </span>
                        </span>
                      ) : (
                        `₹${baseTotal}`
                      )}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              {/* Checkout CTA */}
              <Button
                size="lg"
                className="btn-auspicious-gold"
                onClick={handleProceedToPayment}
                loading={submitting}
                leftSection={finalPayable === 0 ? <IconTicket size={22} /> : <IconCreditCard size={22} />}
                fullWidth
              >
                {finalPayable === 0 ? 'Generate Free Pass' : `Pay ₹${finalPayable} & Generate Pass`}
              </Button>

              <Group justify="center" gap="xs">
                <IconShieldCheck size={16} color="#4ade80" />
                <Text size="xs" c="gray.4">
                  {finalPayable === 0 ? 'Direct Pass Issuance' : '100% Secure Checkout via Razorpay (UPI, Cards, NetBanking)'}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}

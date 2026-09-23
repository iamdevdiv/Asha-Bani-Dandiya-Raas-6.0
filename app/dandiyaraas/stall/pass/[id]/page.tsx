'use client';

import React, { useEffect, useState, use } from 'react';
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
  Badge,
  Loader,
  ThemeIcon,
  SimpleGrid,
  Modal,
  TextInput,
  Divider,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCircleCheck,
  IconPhoneCall,
  IconBuildingStore,
  IconArrowLeft,
  IconMapPin,
  IconCalendarEvent,
  IconClock,
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconCreditCard,
  IconTrash,
  IconPlus,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ExhibitorPassCard } from '@/components/ExhibitorPassCard';
import { StallVoucherLiveFeed } from '@/components/StallVoucherLiveFeed';

export default function StallPassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [additionalMembers, setAdditionalMembers] = useState<any[]>([]);
  const [currentPhase, setCurrentPhase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add Member Modal & Form State
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [memberNames, setMemberNames] = useState<string[]>(['']);
  const [memberErrors, setMemberErrors] = useState<{ [index: number]: string }>({});
  const [submittingMember, setSubmittingMember] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/stalls/booking/${id}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.booking);
          if (data.additionalMembers) setAdditionalMembers(data.additionalMembers);
          if (data.currentPhase) setCurrentPhase(data.currentPhase);
        }
      } catch (err) {
        console.error('Error fetching stall pass:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const teamList = booking?.teamMembers
    ? booking.teamMembers
        .split(/[,&]|\band\b/i)
        .map((m: string) => m.trim())
        .filter(Boolean)
    : (booking?.bookerName ? [booking.bookerName] : []);

  const handleMemberNameChange = (index: number, val: string) => {
    setMemberNames((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (memberErrors[index]) {
      setMemberErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const handleAddMemberField = () => {
    setMemberNames((prev) => [...prev, '']);
  };

  const handleRemoveMemberField = (index: number) => {
    if (memberNames.length <= 1) return;
    setMemberNames((prev) => prev.filter((_, i) => i !== index));
    setMemberErrors((prev) => {
      const next: { [i: number]: string } = {};
      return next;
    });
  };

  const handleAddMemberPayment = async () => {
    const cleanNames = memberNames.map((n) => n.trim());
    const newErrors: { [index: number]: string } = {};

    cleanNames.forEach((name, idx) => {
      if (!name || name.length < 2) {
        newErrors[idx] = 'Please enter a valid full name (minimum 2 characters).';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setMemberErrors(newErrors);
      return;
    }

    setSubmittingMember(true);
    setMemberErrors({});

    try {
      // 1. Create Razorpay order for additional member pass(es)
      const orderRes = await fetch(`/api/stalls/booking/${id}/add-member/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberNames: cleanNames }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order.');
      }

      const count = orderData.memberCount || cleanNames.length;
      const passTitle = count > 1 ? `${count} Additional Passes` : `Additional Pass for ${cleanNames[0]}`;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        name: 'Asha Bani Dandiya Raas 6.0',
        description: `${passTitle} (Stall ${booking.stallNumber})`,
        order_id: orderData.orderId,
        prefill: {
          name: cleanNames.join(', '),
          contact: booking.mobile,
          email: booking.email,
        },
        theme: {
          color: '#991b1b',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`/api/stalls/booking/${id}/add-member/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                memberOrderId: orderData.memberOrderId,
                razorpayOrderId: response.razorpay_order_id || orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              notifications.show({
                title: 'Team Members Added!',
                message: `${cleanNames.join(', ')} added to your stall team. SMS confirmation dispatched!`,
                color: 'green',
              });
              setBooking(verifyData.booking);
              if (verifyData.additionalMembers) {
                setAdditionalMembers(verifyData.additionalMembers);
              }
              setAddMemberModalOpen(false);
              setMemberNames(['']);
              setMemberErrors({});
            } else {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }
          } catch (err: any) {
            notifications.show({
              title: 'Verification Failed',
              message: err.message || 'Could not verify payment. Please contact organizers.',
              color: 'red',
            });
          } finally {
            setSubmittingMember(false);
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: function () {
            notifications.show({
              title: 'Payment Cancelled',
              message: 'Payment window was closed before completion.',
              color: 'yellow',
            });
            setSubmittingMember(false);
          },
        },
      };

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          notifications.show({
            title: 'Payment Failed',
            message: resp.error?.description || 'Payment was unsuccessful. Please try again.',
            color: 'red',
          });
          setSubmittingMember(false);
        });
        rzp.open();
      } else if (orderData.isMock) {
        // Fallback simulation for mock mode in development
        const verifyRes = await fetch(`/api/stalls/booking/${id}/add-member/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberOrderId: orderData.memberOrderId,
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `mock_pay_${Date.now()}`,
            razorpaySignature: 'mock_signature',
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          notifications.show({
            title: 'Team Members Added (Test Mode)!',
            message: `${cleanNames.join(', ')} added to your stall team.`,
            color: 'green',
          });
          setBooking(verifyData.booking);
          if (verifyData.additionalMembers) {
            setAdditionalMembers(verifyData.additionalMembers);
          }
          setAddMemberModalOpen(false);
          setMemberNames(['']);
          setMemberErrors({});
        }
        setSubmittingMember(false);
      } else {
        throw new Error('Payment gateway is loading. Please try again in a few moments.');
      }
    } catch (err: any) {
      console.error('Member addition checkout error:', err);
      notifications.show({
        title: 'Order Error',
        message: err.message || 'Failed to start member checkout. Please try again.',
        color: 'red',
      });
      setSubmittingMember(false);
    }
  };

  return (
    <Box className="festive-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      {loading ? (
        <Container size="md" px={{ base: 'md', sm: 'xl' }} py={100} style={{ textAlign: 'center' }}>
          <Loader color="royalGold" size="xl" />
          <Text mt="md" c="gray.3">
            Loading your official stall allotment details...
          </Text>
        </Container>
      ) : !booking ? (
        <Container size="md" px={{ base: 'md', sm: 'xl' }} py={80} style={{ textAlign: 'center' }}>
          <Paper p="xl" radius="lg" style={{ backgroundColor: 'rgba(36, 8, 14, 0.8)' }}>
            <Title order={2} c="white" mb="sm">
              Stall Booking Not Found
            </Title>
            <Text c="gray.4" mb="lg">
              We could not retrieve the stall pass reference. If you recently completed payment, please contact our support team.
            </Text>
            <Button component={Link} href="/dandiyaraas/stall" className="btn-auspicious-gold">
              Return to Stall Portal
            </Button>
          </Paper>
        </Container>
      ) : (
        <Container size="xl" py={{ base: 30, sm: 50 }} px={{ base: 'md', sm: 'xl' }}>
          {/* Top Banner */}
          <Stack align="center" gap="xs" mb={35} ta="center">
            <ThemeIcon size={60} radius="50%" color="green" variant="light">
              <IconCircleCheck size={38} color="#4ade80" />
            </ThemeIcon>
            <Badge color="green" size="lg" variant="filled">
              OFFICIAL EXHIBITOR PASS &amp; ALLOTMENT
            </Badge>
            <Title
              order={1}
              className="gold-gradient-text"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}
            >
              Stall {booking.stallNumber} • {booking.brandName || booking.bookerName}
            </Title>
            <Text size="md" c="gray.3" maw={650}>
              Official exhibitor digital pass for Asha Bani Dandiya Raas 2026. Keep this pass ready for gate entry scanning and view your live voucher settlements below.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb="xl" style={{ alignItems: 'start' }}>
            {/* Left Column: Official Exhibitor Pass Card */}
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <ExhibitorPassCard booking={booking} showDownloadButton={true} />
            </Box>

            {/* Right Column: Team Management, Venue & Logistics */}
            <Stack gap="md">
              {/* Team Members & Additional Passes Management Card */}
              <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="xl"
                style={{
                  backgroundColor: 'rgba(36, 8, 14, 0.85)',
                  border: '1.5px solid rgba(234, 179, 8, 0.45)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="xs">
                  <Group gap="xs">
                    <ThemeIcon size={36} radius="md" color="yellow" variant="light">
                      <IconUsers size={22} color="#facc15" />
                    </ThemeIcon>
                    <Box>
                      <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                        Exhibitor Team &amp; Passes
                      </Title>
                      <Text size="xs" c="gray.3">
                        Gate passes for your stall staff and assistants
                      </Text>
                    </Box>
                  </Group>

                  {currentPhase && (
                    <Badge color="yellow" variant="outline" size="sm">
                      {currentPhase.name}: ₹{currentPhase.adultPrice}/pass
                    </Badge>
                  )}
                </Group>

                {/* Team Members List */}
                <Stack gap="xs" mb="md">
                  <Text size="xs" fw={700} c="royalGold.3" style={{ letterSpacing: '0.05em' }}>
                    REGISTERED ATTENDEES ({teamList.length} PASSES ACTIVE)
                  </Text>
                  {teamList.map((member: string, idx: number) => {
                    const isExtra = idx >= 2;
                    return (
                      <Paper
                        key={idx}
                        p="xs"
                        radius="md"
                        style={{
                          backgroundColor: isExtra ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                          border: isExtra ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Group justify="space-between" align="center" wrap="nowrap">
                          <Group gap="xs" wrap="nowrap">
                            <ThemeIcon size={24} radius="50%" color={isExtra ? 'yellow' : 'green'} variant="light">
                              <IconUserCheck size={14} />
                            </ThemeIcon>
                            <Text size="sm" fw={600} c="white" style={{ wordBreak: 'break-word' }}>
                              {idx + 1}. {member}
                            </Text>
                          </Group>
                          <Badge size="xs" color={isExtra ? 'yellow' : 'green'} variant="light">
                            {isExtra ? 'Additional Paid Pass' : 'Included Allotment'}
                          </Badge>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>

                {/* Add Member Button */}
                <Button
                  onClick={() => {
                    setMemberErrors({});
                    if (memberNames.length === 0) setMemberNames(['']);
                    setAddMemberModalOpen(true);
                  }}
                  className="btn-auspicious-gold"
                  fullWidth
                  size="md"
                  leftSection={<IconUserPlus size={18} />}
                >
                  + Add Team Members (₹{currentPhase?.adultPrice || 499}/pass)
                </Button>
              </Paper>

              {/* Logistics & Timing Card */}
              <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="xl"
                style={{
                  backgroundColor: 'rgba(36, 8, 14, 0.8)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <Title order={3} size="h4" c="white" mb="md" style={{ fontFamily: "'Cinzel', serif" }}>
                  Event Schedule &amp; Setup Details
                </Title>

                <Stack gap="sm">
                  <Group gap="xs" wrap="nowrap" align="start">
                    <IconCalendarEvent size={18} color="#facc15" className="icon-align-text" />
                    <Box>
                      <Text size="xs" fw={700} c="royalGold.3">EVENT DATE</Text>
                      <Text size="sm" fw={700} c="white">Tuesday, 13 October 2026</Text>
                    </Box>
                  </Group>

                  <Group gap="xs" wrap="nowrap" align="start">
                    <IconClock size={18} color="#facc15" className="icon-align-text" />
                    <Box>
                      <Text size="xs" fw={700} c="royalGold.3">TIMINGS</Text>
                      <Text size="sm" c="white">Vendor Advance Setup: <strong>4:00 PM</strong></Text>
                      <Text size="xs" c="gray.3">Grand Dandiya Hours: <strong>6:00 PM – 12:00 AM</strong></Text>
                    </Box>
                  </Group>

                  <Group gap="xs" wrap="nowrap" align="start">
                    <IconMapPin size={18} color="#facc15" className="icon-align-text" />
                    <Box>
                      <Text size="xs" fw={700} c="royalGold.3">VENUE LOCATION</Text>
                      <Text size="sm" fw={700} c="white">Maharaja Agrasen Bhavan</Text>
                      <Text size="xs" c="gray.3">Aggarwal Dharamshala, Saharanpur</Text>
                    </Box>
                  </Group>
                </Stack>
              </Paper>

              {/* Allotment Terms & Passes Notice */}
              <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="xl"
                style={{
                  backgroundColor: 'rgba(36, 8, 14, 0.8)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <Title order={3} size="h4" c="white" mb="sm" style={{ fontFamily: "'Cinzel', serif" }}>
                  Exhibitor Pass Guidelines
                </Title>
                <Stack gap="xs">
                  <Text size="xs" c="gray.2" style={{ lineHeight: 1.6 }}>
                    • <strong>Entry Passes:</strong> 2 official exhibitor passes are included with this allotment. Additional team members can be added anytime above at the active ticket phase price.
                  </Text>
                  <Text size="xs" c="gray.2" style={{ lineHeight: 1.6 }}>
                    • <strong>Verification at Gate:</strong> Keep your digital QR pass ready on your mobile or printout. Gate verifiers will scan this QR at entry and all registered members will be verified.
                  </Text>
                  <Text size="xs" c="gray.2" style={{ lineHeight: 1.6 }}>
                    • <strong>Non-Transferable:</strong> Each pass is digitally serialized and can be scanned for verification once at the entry gate.
                  </Text>
                </Stack>

                {/* Helpline Assistance Box */}
                <Paper
                  p="sm"
                  radius="md"
                  mt="md"
                  style={{
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                  }}
                >
                  <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                    <Group gap="xs" wrap="nowrap">
                      <IconPhoneCall size={18} color="#facc15" style={{ flexShrink: 0 }} />
                      <Box>
                        <Text size="xs" fw={700} c="royalGold.3">Need Help or Additional Passes?</Text>
                        <Text size="sm" fw={800} c="white">+91 6399063455</Text>
                      </Box>
                    </Group>

                    <Button
                      component="a"
                      href="tel:+916399063455"
                      size="xs"
                      variant="outline"
                      color="royalGold"
                    >
                      Call Helpline
                    </Button>
                  </Group>
                </Paper>
              </Paper>
            </Stack>
          </SimpleGrid>

          {/* Live Voucher Settlements & Payments Received Section */}
          <Box mb="xl">
            <StallVoucherLiveFeed
              bookingId={booking.id}
              stallNumber={booking.stallNumber}
              brandName={booking.brandName || booking.bookerName}
            />
          </Box>

          {/* Navigation Buttons */}
          <Group justify="center" gap="md" mt="xl">
            <Button
              component={Link}
              href="/dandiyaraas"
              variant="subtle"
              color="royalGold"
              leftSection={<IconArrowLeft size={18} />}
            >
              Back to Event Home
            </Button>
            <Button
              component={Link}
              href="/dandiyaraas/stall"
              variant="light"
              color="royalGold"
              leftSection={<IconBuildingStore size={18} />}
            >
              View Stall Portal
            </Button>
          </Group>
        </Container>
      )}

      {/* Add New Team Member Modal */}
      {booking && (
        <Modal
          opened={addMemberModalOpen}
          onClose={() => {
            if (!submittingMember) {
              setAddMemberModalOpen(false);
              setMemberNames(['']);
              setMemberErrors({});
            }
          }}
          title={
            <Text fw={800} c="white" style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem' }}>
              Add Team Members • Stall {booking.stallNumber}
            </Text>
          }
          centered
          size="lg"
          styles={{
            content: {
              backgroundColor: '#1b0407',
              border: '2px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '20px',
              color: '#fff',
            },
            header: {
              backgroundColor: '#1b0407',
              borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
            },
          }}
        >
          <Stack gap="md">
            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Group justify="space-between">
                <Text size="xs" c="gray.3">STALL NUMBER:</Text>
                <Text size="sm" fw={800} c="yellow.3">Stall {booking.stallNumber}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="gray.3">BRAND / BUSINESS:</Text>
                <Text size="sm" fw={700} c="white">{booking.brandName || booking.bookerName}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="gray.3">TICKET PRICE (ACTIVE PHASE):</Text>
                <Text size="sm" fw={800} c="yellow.2">
                  ₹{currentPhase?.adultPrice || 499} per pass ({currentPhase?.name || 'Active Phase'})
                </Text>
              </Group>
            </Paper>

            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} c="royalGold.3" style={{ letterSpacing: '0.05em' }}>
                  TEAM MEMBER NAMES ({memberNames.length} {memberNames.length === 1 ? 'PASS' : 'PASSES'})
                </Text>
                <Button
                  variant="subtle"
                  color="yellow"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={handleAddMemberField}
                >
                  Add Another Member
                </Button>
              </Group>

              {memberNames.map((name, idx) => (
                <Group key={idx} align="flex-start" gap="xs" wrap="nowrap">
                  <Box style={{ flex: 1 }}>
                    <TextInput
                      label={memberNames.length > 1 ? `Member ${idx + 1} Full Name` : 'Member Full Name'}
                      withAsterisk
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => handleMemberNameChange(idx, e.currentTarget.value)}
                      error={memberErrors[idx]}
                      size="md"
                      styles={{
                        label: {
                          color: '#facc15',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          marginBottom: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        },
                        required: {
                          color: '#ef4444',
                        },
                        input: {
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          color: '#fff',
                          borderColor: memberErrors[idx] ? '#ef4444' : 'rgba(234, 179, 8, 0.4)',
                        },
                      }}
                    />
                  </Box>
                  {memberNames.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="light"
                      size="lg"
                      mt={26}
                      onClick={() => handleRemoveMemberField(idx)}
                      title="Remove this member"
                      style={{ height: 42, width: 42 }}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  )}
                </Group>
              ))}
            </Stack>

            <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <Group justify="space-between" align="center">
                <Box>
                  <Text size="xs" c="gray.3">
                    {memberNames.length} {memberNames.length === 1 ? 'Pass' : 'Passes'} × ₹{currentPhase?.adultPrice || 499}
                  </Text>
                  <Text size="sm" fw={800} c="white">
                    Total Amount:
                  </Text>
                </Box>
                <Title order={3} c="yellow.3">
                  ₹{memberNames.length * (currentPhase?.adultPrice || 499)}
                </Title>
              </Group>
              <Divider my="xs" color="rgba(255, 255, 255, 0.08)" />
              <Text size="xs" c="gray.4" style={{ lineHeight: 1.5 }}>
                • Added members will be linked directly to your official stall allotment.
                <br />
                • A confirmation SMS will be sent automatically to <strong>+91 {booking.mobile}</strong> upon successful payment.
              </Text>
            </Paper>

            <Button
              onClick={handleAddMemberPayment}
              loading={submittingMember}
              size="md"
              className="btn-auspicious-gold"
              leftSection={<IconCreditCard size={18} />}
              fullWidth
            >
              Pay ₹{memberNames.length * (currentPhase?.adultPrice || 499)} &amp; Add {memberNames.length} {memberNames.length === 1 ? 'Member' : 'Members'}
            </Button>
          </Stack>
        </Modal>
      )}

      <Footer />
    </Box>
  );
}


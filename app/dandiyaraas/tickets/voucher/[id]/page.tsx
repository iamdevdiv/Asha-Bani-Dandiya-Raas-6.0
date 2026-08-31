'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
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
  Divider,
  NumberInput,
  Modal,
  Alert,
  Loader,
  Center,
  ThemeIcon,
  Timeline,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingStore,
  IconQrcode,
  IconCamera,
  IconCheck,
  IconArrowLeft,
  IconHistory,
  IconAlertTriangle,
  IconSparkles,
} from '@tabler/icons-react';
import jsQR from 'jsqr';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { INITIAL_STALLS, isFoodStall, isCommercialStall, getStallCategoryLabel } from '@/lib/stall-data';

export default function StallVoucherWalletPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const walletId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  // Payment Form
  const [selectedStall, setSelectedStall] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number | string>(50);

  // Camera Scanner State
  const [openedScanner, { open: openScanner, close: closeScanner }] = useDisclosure(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanCategoryError, setScanCategoryError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScanningRef = useRef(false);
  const animationFrameIdRef = useRef<number | null>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);

  const fetchWallet = () => {
    fetch(`/api/vouchers/${walletId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.wallet) {
          setWallet(data.wallet);
        } else {
          notifications.show({
            title: 'Not Found',
            message: data.message || 'Voucher wallet not found',
            color: 'red',
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching wallet:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWallet();
  }, [walletId]);

  const parseScannedStall = (raw: string): string | null => {
    try {
      const obj = JSON.parse(raw);
      if (obj.stall) return String(obj.stall).toUpperCase();
    } catch {}

    const match = raw.match(/STALL[-_ ]?([A-Ta-t0-9]+)/i);
    if (match) return match[1].toUpperCase();

    const trimmed = raw.trim().toUpperCase();
    if (INITIAL_STALLS.some((s) => s.stallNumber.toUpperCase() === trimmed)) {
      return trimmed;
    }
    return null;
  };

  // Continuous frame scanner loop with jsQR
  const tickScan = () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    if (video && video.readyState >= 2 && canvas) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const stall = parseScannedStall(code.data);
          if (stall) {
            const isFood = isFoodStall(stall);
            const applicableTo = wallet?.applicableTo || 'both';

            if (applicableTo === 'food' && !isFood) {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([150, 100, 150]);
              }
              const errTxt = `Stall ${stall} is a Commercial & Shopping Stall. Your voucher is strictly valid at Food Stalls (1–15) only.`;
              setScanCategoryError(errTxt);
              notifications.show({
                id: 'category-err',
                title: 'Stall Not Permitted',
                message: `Your voucher cannot be used at Stall ${stall}. Food Stalls only (1–15).`,
                color: 'red',
                autoClose: 4500,
              });

              // Pause scanning for 2 seconds so user sees error, then resume
              setTimeout(() => {
                if (isScanningRef.current) {
                  animationFrameIdRef.current = requestAnimationFrame(tickScan);
                }
              }, 2000);
              return;
            }

            if (applicableTo === 'other' && isFood) {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([150, 100, 150]);
              }
              const errTxt = `Stall ${stall} is a Food Stall. Your voucher is strictly valid at Commercial & Shopping Stalls (A–T) only.`;
              setScanCategoryError(errTxt);
              notifications.show({
                id: 'category-err',
                title: 'Stall Not Permitted',
                message: `Your voucher cannot be used at Stall ${stall}. Commercial & Shopping Stalls only (A–T).`,
                color: 'red',
                autoClose: 4500,
              });

              setTimeout(() => {
                if (isScanningRef.current) {
                  animationFrameIdRef.current = requestAnimationFrame(tickScan);
                }
              }, 2000);
              return;
            }

            // Valid stall scan
            isScanningRef.current = false;
            setScanCategoryError(null);
            setSelectedStall(stall);
            closeScanner();
            notifications.show({
              title: 'Stall QR Verified',
              message: `Locked onto ${isFood ? 'Food' : 'Commercial'} Stall ${stall}. Enter amount to pay.`,
              color: 'green',
            });
            return;
          }
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(tickScan);
    }
  };

  // Handle QR Camera Stream
  useEffect(() => {
    if (openedScanner) {
      setCameraError(null);
      isScanningRef.current = true;

      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          scannerStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
              animationFrameIdRef.current = requestAnimationFrame(tickScan);
            });
          }
        })
        .catch((err) => {
          console.warn('Camera access error:', err);
          setCameraError('Unable to access device camera. Please ensure camera permissions are granted in your browser settings.');
        });
    } else {
      isScanningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((track) => track.stop());
        scannerStreamRef.current = null;
      }
    }

    return () => {
      isScanningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (scannerStreamRef.current) {
        scannerStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [openedScanner]);



  const handlePayStall = async () => {
    if (!selectedStall) {
      notifications.show({
        title: 'Scan Stall QR',
        message: 'Please scan the stall QR code at the canopy before paying.',
        color: 'yellow',
      });
      return;
    }

    const num = Number(payAmount);
    if (!num || num <= 0) {
      notifications.show({
        title: 'Invalid Amount',
        message: 'Please enter a voucher amount greater than ₹0.',
        color: 'red',
      });
      return;
    }

    if (num > (wallet?.balance || 0)) {
      notifications.show({
        title: 'Insufficient Balance',
        message: `You only have ₹${wallet?.balance} available in your voucher wallet.`,
        color: 'red',
      });
      return;
    }

    setPaying(true);
    try {
      const res = await fetch('/api/vouchers/pay-stall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: wallet.id,
          walletType: wallet.type,
          stallNumber: selectedStall,
          amount: num,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Voucher redemption failed');
      }

      notifications.show({
        title: 'Payment Successful',
        message: `Paid ₹${num} to Stall ${selectedStall.toUpperCase()}`,
        color: 'green',
      });

      setSelectedStall(null);
      setPayAmount(Math.min(50, data.balance));
      fetchWallet();
    } catch (err: any) {
      notifications.show({
        title: 'Payment Failed',
        message: err.message || 'Error processing voucher transaction.',
        color: 'red',
      });
    } finally {
      setPaying(false);
    }
  };

  const currentStallDetails = selectedStall
    ? INITIAL_STALLS.find((s) => s.stallNumber.toUpperCase() === selectedStall.toUpperCase())
    : null;

  if (loading) {
    return (
      <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Center>
          <Stack align="center" gap="sm">
            <Loader color="royalGold" size="lg" />
            <Text c="gray.4" size="sm" fw={600}>
              Loading stall voucher wallet...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (!wallet) {
    return (
      <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container size="sm" py={80} style={{ flexGrow: 1, textAlign: 'center' }}>
          <Alert color="red" title="Wallet Not Found" icon={<IconAlertTriangle size={24} />}>
            Voucher wallet could not be loaded. Please ensure you are using the correct pass link.
          </Alert>
          <Button component={Link} href="/dandiyaraas" mt="lg" className="btn-auspicious-gold">
            Return to Event Home
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container size="sm" py={50} style={{ flexGrow: 1 }}>
        <Stack gap="xl">
          {/* Top Bar */}
          <Group justify="space-between" align="center">
            <Button
              component={Link}
              href={wallet.type === 'ticket' ? `/dandiyaraas/tickets/pass/${wallet.id}` : '/ambassador/dashboard'}
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              size="xs"
            >
              {wallet.type === 'ticket' ? 'Back to Entry Pass' : 'Back to Dashboard'}
            </Button>
            <Badge color="yellow" variant="filled" size="md" className="badge-gold-filled" style={{ color: '#140305', fontWeight: 800, backgroundColor: '#facc15' }}>
              STALL VOUCHER WALLET
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
              style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}
            >
              Exhibitor Stall Voucher
            </Title>
            <Text size="sm" c="gray.3" mt={4}>
              Attendee: <b>{wallet.holderName}</b> • Pass Ref: <b style={{ color: '#facc15', fontFamily: 'monospace' }}>{wallet.holderRef}</b>
            </Text>
          </Box>

          {/* Wallet Balance Hero Card */}
          <Paper
            p="xl"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, rgba(42, 8, 12, 0.95) 0%, rgba(20, 3, 5, 0.95) 100%)',
              border: '2px solid rgba(250, 204, 21, 0.5)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              textAlign: 'center',
            }}
          >
            <Stack align="center" gap="xs">
              <Badge color="royalGold" variant="light" size="sm" style={{ color: '#fef08a', fontWeight: 700 }}>
                AVAILABLE VOUCHER BALANCE
              </Badge>
              <Text
                size="44px"
                fw={900}
                className="gold-gradient-text"
                style={{ fontFamily: "'Cinzel', serif", lineHeight: 1.1 }}
              >
                ₹{wallet.balance}
              </Text>
              <Group gap="xs" justify="center" wrap="wrap">
                <Text size="xs" c="gray.4">
                  Total Credited: <b>₹{wallet.totalCredited}</b>
                </Text>
                <Text size="xs" c="gray.5">•</Text>
                <Badge
                  color={wallet.applicableTo === 'food' ? 'orange' : wallet.applicableTo === 'other' ? 'grape' : 'green'}
                  variant={wallet.isCustomRule ? 'filled' : 'light'}
                  size="xs"
                >
                  {wallet.isCustomRule ? '★ Special Access: ' : 'Usable at: '}
                  {wallet.applicableTo === 'food'
                    ? 'Food Stalls (1–15)'
                    : wallet.applicableTo === 'other'
                    ? 'Commercial Stalls (A–T)'
                    : 'All 35 Stalls'}
                </Badge>
              </Group>
            </Stack>
          </Paper>

          {/* Payment Section: Strictly Camera QR Scan Flow */}
          <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="xl"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Stack gap="lg">
              <Title order={2} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                Make a Payment to Stall
              </Title>

              {wallet.balance <= 0 ? (
                <Alert color="yellow" title="Voucher Balance Exhausted" icon={<IconAlertTriangle size={20} />}>
                  You have fully utilized your voucher amount. Thank you for celebrating with our exhibitors!
                </Alert>
              ) : !selectedStall ? (
                /* State 1: Scan Stall QR Code */
                <Box ta="center" py="md">
                  <ThemeIcon size={64} radius="50%" color="yellow" variant="light" mb="md" mx="auto">
                    <IconQrcode size={36} color="#facc15" />
                  </ThemeIcon>
                  <Text size="sm" c="gray.3" mb="lg" maw={380} mx="auto">
                    Scan the official QR code displayed at any food or commercial stall canopy to transfer voucher credit.
                  </Text>
                  <Button
                    size="lg"
                    className="btn-auspicious-gold"
                    onClick={openScanner}
                    leftSection={<IconCamera size={22} />}
                    fullWidth
                    style={{ height: 48 }}
                  >
                    Scan Stall QR Code
                  </Button>
                </Box>
              ) : (
                /* State 2: Stall Locked via QR - Enter Amount & Pay */
                (() => {
                  const isSelectedStallFood = selectedStall ? isFoodStall(selectedStall) : false;
                  const isStallEligible = selectedStall
                    ? wallet.applicableTo === 'food'
                      ? isSelectedStallFood
                      : wallet.applicableTo === 'other'
                      ? !isSelectedStallFood
                      : true
                    : true;

                  return (
                    <Stack gap="md">
                      {isStallEligible ? (
                        <Paper
                          p="md"
                          radius="md"
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(74, 222, 128, 0.4)',
                          }}
                        >
                          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                            <Group gap="xs">
                              <ThemeIcon size={36} radius="md" color="green" variant="filled">
                                <IconCheck size={20} color="#ffffff" />
                              </ThemeIcon>
                              <Box>
                                <Group gap={6} align="center">
                                  <Text size="xs" fw={700} c="green.3">
                                    SCANNED STALL VERIFIED
                                  </Text>
                                  <Badge size="xs" color={isSelectedStallFood ? 'yellow' : 'cyan'} variant="light">
                                    {isSelectedStallFood ? 'Food Zone (1–15)' : 'Commercial Zone (A–T)'}
                                  </Badge>
                                </Group>
                                <Text size="md" fw={800} c="white">
                                  Stall {selectedStall.toUpperCase()}{currentStallDetails ? ` • ${currentStallDetails.sectionLabel}` : ''}
                                </Text>
                              </Box>
                            </Group>

                            <Button
                              size="xs"
                              variant="subtle"
                              color="gray"
                              onClick={() => {
                                setScanCategoryError(null);
                                openScanner();
                              }}
                              leftSection={<IconCamera size={14} />}
                            >
                              Scan Different Stall
                            </Button>
                          </Group>
                        </Paper>
                      ) : (
                        <Alert
                          color="red"
                          title="Ineligible Stall Scanned"
                          icon={<IconAlertTriangle size={20} />}
                        >
                          <Text size="sm">
                            Your voucher is strictly valid at <b>{wallet.applicableTo === 'food' ? 'Food Stalls (1–15) Only' : 'Commercial & Shopping Stalls (A–T) Only'}</b>. Stall {selectedStall.toUpperCase()} is a {isSelectedStallFood ? 'Food Stall' : 'Commercial & Shopping Stall'} and cannot accept this voucher.
                          </Text>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            mt="xs"
                            onClick={() => {
                              setSelectedStall(null);
                              setScanCategoryError(null);
                              openScanner();
                            }}
                            leftSection={<IconCamera size={14} />}
                          >
                            Scan Eligible Stall QR
                          </Button>
                        </Alert>
                      )}

                      {/* Amount Input */}
                      <NumberInput
                        label="Amount to Pay (₹)"
                        placeholder="Enter amount"
                        min={1}
                        max={wallet.balance}
                        value={payAmount}
                        onChange={setPayAmount}
                        disabled={!isStallEligible}
                        prefix="₹"
                        description={`Max available voucher balance: ₹${wallet.balance}`}
                        styles={{
                          input: {
                            backgroundColor: '#120204',
                            borderColor: 'rgba(234, 179, 8, 0.3)',
                            color: '#ffffff',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                          },
                        }}
                      />

                      {/* Quick Amount Pills */}
                      <Group gap="xs">
                        <Text size="xs" c="gray.4">Quick Amount:</Text>
                        {[50, 100].filter((amt) => amt <= wallet.balance).map((amt) => (
                          <Button
                            key={amt}
                            size="xs"
                            variant="light"
                            color="royalGold"
                            disabled={!isStallEligible}
                            onClick={() => setPayAmount(amt)}
                          >
                            ₹{amt}
                          </Button>
                        ))}
                        {wallet.balance > 0 && (
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            disabled={!isStallEligible}
                            onClick={() => setPayAmount(wallet.balance)}
                          >
                            Full Balance (₹{wallet.balance})
                          </Button>
                        )}
                      </Group>

                      {/* Submit Button */}
                      <Button
                        size="lg"
                        className="btn-auspicious-gold"
                        onClick={handlePayStall}
                        loading={paying}
                        disabled={!isStallEligible || Number(payAmount) <= 0 || Number(payAmount) > wallet.balance}
                        leftSection={<IconBuildingStore size={22} />}
                        fullWidth
                        style={{ height: 48 }}
                      >
                        Confirm &amp; Pay ₹{payAmount || 0} to Stall {selectedStall.toUpperCase()}
                      </Button>
                    </Stack>
                  );
                })()
              )}
            </Stack>
          </Paper>

          {/* Transaction History Section */}
          <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="xl"
            style={{
              backgroundColor: 'rgba(20, 3, 5, 0.85)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <Stack gap="md">
              <Group gap="xs">
                <IconHistory size={22} color="#facc15" />
                <Title order={3} size="h4" c="white" style={{ fontFamily: "'Cinzel', serif" }}>
                  Voucher Transaction History
                </Title>
              </Group>

              <Divider color="rgba(234, 179, 8, 0.2)" />

              {(!wallet.transactions || wallet.transactions.length === 0) ? (
                <Text size="sm" c="gray.4" ta="center" py="md">
                  No transactions recorded yet.
                </Text>
              ) : (
                <Timeline active={0} bulletSize={28} lineWidth={2} color="royalGold">
                  {wallet.transactions.map((tx: any, index: number) => {
                    const isCredit = tx.type === 'credit';
                    return (
                      <Timeline.Item
                        key={tx.id || index}
                        bullet={
                          <ThemeIcon
                            size={24}
                            radius="xl"
                            color={isCredit ? 'green' : 'yellow'}
                            variant="filled"
                          >
                            {isCredit ? <IconSparkles size={14} /> : <IconBuildingStore size={14} />}
                          </ThemeIcon>
                        }
                        title={
                          <Group justify="space-between" align="center">
                            <Text size="sm" fw={700} c={isCredit ? 'green.3' : 'white'}>
                              {isCredit ? `+₹${tx.amount} Credit` : `-₹${tx.amount} Stall Payment`}
                            </Text>
                            <Text size="xs" c="gray.5">
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </Group>
                        }
                      >
                        <Text size="xs" c="gray.3" mt={2}>
                          {tx.description}
                        </Text>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              )}
            </Stack>
          </Paper>

          {/* Security Alert */}
          <Alert icon={<IconAlertTriangle size={18} />} color="red" radius="md" variant="light">
            <Text size="xs" fw={600} c="red.2">
              Keep this voucher wallet link confidential. Voucher redemptions are verified in real time and cannot be refunded or cancelled once submitted.
            </Text>
          </Alert>
        </Stack>
      </Container>

      {/* Camera QR Scanner Modal */}
      <Modal
        opened={openedScanner}
        onClose={() => {
          setScanCategoryError(null);
          closeScanner();
        }}
        title={
          <Group gap="xs">
            <IconQrcode size={20} color="#facc15" />
            <Text fw={700} c="white">
              Scan Stall QR Code
            </Text>
          </Group>
        }
        styles={{
          content: { backgroundColor: '#140305', border: '1px solid rgba(234, 179, 8, 0.4)' },
          header: { backgroundColor: '#140305' },
        }}
      >
        <Stack gap="md" align="center">
          {/* Usability Guidance Badge */}
          <Paper
            p="xs"
            w="100%"
            radius="md"
            style={{
              backgroundColor: wallet?.applicableTo === 'food' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              textAlign: 'center',
            }}
          >
            <Text size="xs" fw={700} c="yellow.3">
              {wallet?.applicableTo === 'food'
                ? '🍔 VALID AT: Food Stalls (1–15) Only'
                : wallet?.applicableTo === 'other'
                ? '🛍️ VALID AT: Commercial & Shopping Stalls (A–T) Only'
                : '🌟 VALID AT: All 35 Stalls (Food & Commercial)'}
            </Text>
          </Paper>

          {scanCategoryError && (
            <Alert color="red" title="Ineligible Stall Scanned" icon={<IconAlertTriangle size={18} />} w="100%">
              {scanCategoryError}
            </Alert>
          )}

          <Box
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 320,
              height: 260,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#000000',
              border: scanCategoryError ? '2px solid #ef4444' : '2px solid rgba(250, 204, 21, 0.5)',
            }}
          >
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              playsInline
              muted
            />
          </Box>

          {cameraError && (
            <Alert color="yellow" title="Camera Notice">
              {cameraError}
            </Alert>
          )}

          <Text size="xs" c="gray.4" ta="center">
            Point camera at the printed QR code displayed at any stall canopy.
          </Text>
        </Stack>
      </Modal>

      <Footer />
    </Box>
  );
}

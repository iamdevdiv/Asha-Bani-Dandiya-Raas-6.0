'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Box,
  Badge,
  Alert,
  Loader,
  SimpleGrid,
  ThemeIcon,
  Divider,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconScan,
  IconCircleCheck,
  IconAlertTriangle,
  IconLogout,
  IconCamera,
  IconCameraOff,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconBuildingStore,
  IconClock,
  IconUser,
  IconShieldCheck,
  IconFlame,
} from '@tabler/icons-react';
import jsQR from 'jsqr';

interface ScanResult {
  status: 'valid' | 'duplicate' | 'invalid';
  message: string;
  booking?: any;
  checkedInAt?: string;
  checkedInBy?: string;
}

export default function VerifierScanPage() {
  const router = useRouter();
  const [verifier, setVerifier] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const [hasLiveCameraSupport, setHasLiveCameraSupport] = useState(true);

  // 1. Verify Authentication
  useEffect(() => {
    fetch('/api/verifier/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVerifier(data.user);
          startCamera();
        } else {
          router.push('/verifier/login');
        }
      })
      .catch(() => {
        router.push('/verifier/login');
      })
      .finally(() => {
        setLoadingAuth(false);
      });

    return () => {
      stopCamera();
    };
  }, [router]);

  // 2. Camera Controls (Safe MediaDevices check & playback promise handling)
  const startCamera = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        console.info('Live video stream requires HTTPS or localhost. Falling back to native camera photo snap.');
        setHasLiveCameraSupport(false);
        setCameraActive(false);
        return;
      }

      setHasLiveCameraSupport(true);
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              setCameraActive(true);
              isScanningRef.current = true;
              if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = requestAnimationFrame(tickScan);
            })
            .catch((e) => {
              if (e.name !== 'AbortError') {
                console.warn('Camera video play error:', e);
              }
            });
        };
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Camera access error:', err);
      }
      setCameraActive(false);
      isScanningRef.current = false;
    }
  };

  const stopCamera = () => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null;
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // 3. Photo Capture Fallback (Works on ALL mobile devices even over HTTP)
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            handleVerifyCode(code.data);
          } else {
            notifications.show({
              title: 'No QR Code Detected',
              message: 'Could not detect a valid QR code in the photo. Please ensure clear lighting and steady focus.',
              color: 'yellow',
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 4. Continuous Frame-by-Frame QR Scanner loop (Ref-based, immune to stale closures)
  const tickScan = () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

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

        if (code && code.data && !processing) {
          isScanningRef.current = false;
          handleVerifyCode(code.data);
          return;
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(tickScan);
    }
  };

  // 5. Verification Action
  const handleVerifyCode = async (code: string) => {
    if (!code.trim() || processing) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/verifier/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.alreadyCheckedIn) {
          // Duplicate entry attempt
          setScanResult({
            status: 'duplicate',
            message: data.message || 'DUPLICATE ENTRY ALERT: Pass already scanned!',
            booking: data.booking,
            checkedInAt: data.checkedInAt,
            checkedInBy: data.checkedInBy,
          });

          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        } else {
          // Valid initial entry
          setScanResult({
            status: 'valid',
            message: 'PASS VERIFIED - ENTRY APPROVED',
            booking: data.booking,
          });

          setRecentScans((prev) => [
            {
              stallNumber: data.booking.stallNumber,
              brandName: data.booking.brandName,
              bookerName: data.booking.bookerName,
              time: new Date().toLocaleTimeString(),
              status: 'APPROVED',
            },
            ...prev.slice(0, 9),
          ]);

          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(100);
          }
        }
      } else {
        setScanResult({
          status: 'invalid',
          message: data.message || 'Invalid or unrecognized QR pass.',
        });
      }
    } catch (err: any) {
      notifications.show({
        title: 'Scanning Error',
        message: err.message || 'Network error occurred.',
        color: 'red',
      });
      setTelemetry((t) => ({ ...t, status: `Network error: ${err.message}` }));
    } finally {
      setProcessing(false);
    }
  };

  const handleNextScan = () => {
    setScanResult(null);
    setManualCode('');
    isScanningRef.current = true;
    if (!cameraActive) {
      startCamera();
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(tickScan);
    }
  };

  const handleLogout = async () => {
    stopCamera();
    await fetch('/api/verifier/auth/logout', { method: 'POST' });
    router.push('/verifier/login');
  };

  if (loadingAuth) {
    return (
      <Box className="festive-background" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader color="royalGold" size="xl" />
      </Box>
    );
  }

  return (
    <Box className="festive-background" style={{ minHeight: '100vh', padding: '16px' }}>
      <Container size="sm" p={0}>
        {/* Top Header Bar */}
        <Paper
          p="sm"
          mb="md"
          radius="lg"
          style={{
            backgroundColor: 'rgba(26, 4, 8, 0.95)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="xs" align="center">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid #facc15',
                  position: 'relative',
                }}
              >
                <Image src="/icon1.png" alt="Logo" fill sizes="32px" style={{ objectFit: 'cover' }} />
              </Box>
              <Box>
                <Text size="xs" fw={800} className="gold-gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
                  GATE SCANNER DESK
                </Text>
                <Text size="xs" c="gray.4" lineClamp={1}>
                  Verifier: <strong>{verifier?.name}</strong>
                </Text>
              </Box>
            </Group>

            <Button size="xs" color="red" variant="subtle" onClick={handleLogout} leftSection={<IconLogout size={14} />}>
              Sign Out
            </Button>
          </Group>
        </Paper>

        {/* Scan Result Modal / Card (Takes Over When Scanned) */}
        {scanResult ? (
          <Paper
            p="xl"
            radius="xl"
            mb="lg"
            className="ornament-corner-container"
            style={{
              backgroundColor: scanResult.status === 'valid' ? 'rgba(6, 44, 20, 0.95)' : scanResult.status === 'duplicate' ? 'rgba(69, 10, 10, 0.95)' : 'rgba(30, 4, 8, 0.95)',
              border: scanResult.status === 'valid' ? '3px solid #22c55e' : '3px solid #ef4444',
              boxShadow: scanResult.status === 'valid' ? '0 0 35px rgba(34, 197, 94, 0.4)' : '0 0 40px rgba(239, 68, 68, 0.5)',
              color: '#ffffff',
            }}
          >
            <Stack align="center" gap="md" ta="center">
              {scanResult.status === 'valid' && (
                <>
                  <ThemeIcon size={70} radius="50%" color="green" variant="filled">
                    <IconCircleCheck size={46} color="#ffffff" />
                  </ThemeIcon>

                  <Badge color="green" size="xl" variant="filled" style={{ fontSize: '1rem', padding: '12px 20px' }}>
                    ENTRY APPROVED • 1ST SCAN
                  </Badge>

                  <Title order={2} c="white" style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem' }}>
                    STALL {scanResult.booking?.stallNumber}
                  </Title>

                  <Paper
                    w="100%"
                    p="md"
                    radius="md"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Stack gap="xs" ta="left">
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">BRAND / BUSINESS:</Text>
                        <Text size="sm" fw={800} c="yellow.3">{scanResult.booking?.brandName}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">CONTACT PERSON:</Text>
                        <Text size="sm" fw={700} c="white">{scanResult.booking?.bookerName}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">MOBILE:</Text>
                        <Text size="xs" c="white">+91 {scanResult.booking?.mobile}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">ALLOTTED PASSES:</Text>
                        <Text size="xs" fw={700} c="green.3">2 Team Members</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">TEAM MEMBERS:</Text>
                        <Text size="xs" c="white">{scanResult.booking?.teamMembers || scanResult.booking?.bookerName}</Text>
                      </Group>
                      <Divider my={4} color="rgba(255,255,255,0.1)" />
                      <Group justify="space-between">
                        <Text size="xs" c="gray.4">CHECKED IN AT:</Text>
                        <Text size="xs" c="gray.3">{new Date().toLocaleTimeString()}</Text>
                      </Group>
                    </Stack>
                  </Paper>
                </>
              )}

              {scanResult.status === 'duplicate' && (
                <>
                  <ThemeIcon size={70} radius="50%" color="red" variant="filled">
                    <IconAlertTriangle size={46} color="#ffffff" />
                  </ThemeIcon>

                  <Badge color="red" size="xl" variant="filled" style={{ fontSize: '1.05rem', padding: '14px 20px' }}>
                    🚨 DUPLICATE ENTRY ALERT!
                  </Badge>

                  <Title order={2} c="red.2" style={{ fontFamily: "'Cinzel', serif", fontSize: '1.6rem' }}>
                    PASS ALREADY SCANNED
                  </Title>

                  <Alert color="red" variant="filled" title="Theft Prevention Triggered" w="100%">
                    This QR pass was already scanned and used to enter the venue! Do not permit secondary entry.
                  </Alert>

                  <Paper
                    w="100%"
                    p="md"
                    radius="md"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                  >
                    <Stack gap="xs" ta="left">
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">STALL NUMBER:</Text>
                        <Text size="sm" fw={800} c="yellow.3">Stall {scanResult.booking?.stallNumber}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">BRAND NAME:</Text>
                        <Text size="sm" fw={700} c="white">{scanResult.booking?.brandName}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">REGISTERED BOOKER:</Text>
                        <Text size="xs" c="white">{scanResult.booking?.bookerName} ({scanResult.booking?.mobile})</Text>
                      </Group>
                      <Divider my={4} color="rgba(255,255,255,0.1)" />
                      <Group justify="space-between">
                        <Text size="xs" c="red.3" fw={700}>FIRST SCANNED AT:</Text>
                        <Text size="xs" c="red.2" fw={800}>
                          {scanResult.checkedInAt ? new Date(scanResult.checkedInAt).toLocaleTimeString() : 'Earlier'}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="gray.3">VERIFIED BY:</Text>
                        <Text size="xs" c="white">{scanResult.checkedInBy || 'Gate Verifier'}</Text>
                      </Group>
                    </Stack>
                  </Paper>
                </>
              )}

              {scanResult.status === 'invalid' && (
                <>
                  <ThemeIcon size={64} radius="50%" color="red" variant="light">
                    <IconAlertTriangle size={38} color="#f87171" />
                  </ThemeIcon>
                  <Title order={3} c="white">
                    Invalid Pass Reference
                  </Title>
                  <Text size="sm" c="gray.3">
                    {scanResult.message}
                  </Text>
                </>
              )}

              <Button
                onClick={handleNextScan}
                size="lg"
                fullWidth
                mt="md"
                className="btn-auspicious-gold"
                leftSection={<IconScan size={22} />}
              >
                Scan Next Pass
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* Live Scanner & Camera Viewfinder */
          <Stack gap="md">
            <Paper
              p="md"
              radius="xl"
              style={{
                backgroundColor: 'rgba(26, 4, 8, 0.95)',
                border: '2px solid rgba(234, 179, 8, 0.35)',
                textAlign: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Hidden File Input for Native Camera Capture */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                style={{ display: 'none' }}
              />

              <Group justify="space-between" align="center" mb="xs">
                <Text size="xs" fw={700} c="royalGold.3" style={{ letterSpacing: '0.1em' }}>
                  {hasLiveCameraSupport ? 'LIVE QR SCANNER' : 'CAMERA PASS SCANNER'}
                </Text>

                {hasLiveCameraSupport && (
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="royalGold"
                      onClick={toggleCameraFacing}
                      title="Flip Camera"
                    >
                      <IconRefresh size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color={cameraActive ? 'red' : 'green'}
                      onClick={cameraActive ? stopCamera : startCamera}
                      title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
                    >
                      {cameraActive ? <IconCameraOff size={16} /> : <IconCamera size={16} />}
                    </ActionIcon>
                  </Group>
                )}
              </Group>

              {/* Video Stream / Snap View Container */}
              <Box
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: hasLiveCameraSupport ? 240 : 180,
                  backgroundColor: '#050002',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '2px dashed rgba(234, 179, 8, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                }}
              >
                {hasLiveCameraSupport && (
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: cameraActive ? 'block' : 'none',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {(!hasLiveCameraSupport || !cameraActive) && (
                  <Stack align="center" gap="sm" style={{ zIndex: 2 }}>
                    <ThemeIcon size={54} radius="50%" color="royalGold" variant="light">
                      <IconCamera size={30} color="#facc15" />
                    </ThemeIcon>

                    <Text size="sm" c="gray.3" fw={600}>
                      Scan Attendee Pass QR
                    </Text>

                    <Group justify="center" gap="xs" wrap="wrap">
                      <Button
                        size="sm"
                        className="btn-auspicious-gold"
                        leftSection={<IconCamera size={18} />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Snap Pass Photo
                      </Button>

                      {hasLiveCameraSupport && (
                        <Button size="sm" variant="light" color="royalGold" onClick={startCamera}>
                          Start Live Stream
                        </Button>
                      )}
                    </Group>
                  </Stack>
                )}

                {/* Laser Aim Box for Live Camera */}
                {hasLiveCameraSupport && cameraActive && (
                  <Box
                    style={{
                      position: 'absolute',
                      width: '65%',
                      height: '65%',
                      border: '2px solid #facc15',
                      borderRadius: 16,
                      boxShadow: '0 0 20px rgba(250, 204, 21, 0.4), inset 0 0 20px rgba(250, 204, 21, 0.2)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </Box>

              <Text size="xs" c="gray.4" mt="xs">
                Snap or scan the attendee's QR pass for verification.
              </Text>
            </Paper>

            {/* Manual Reference Entry */}
            <Paper
              p="md"
              radius="lg"
              style={{
                backgroundColor: 'rgba(26, 4, 8, 0.95)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <Text size="xs" fw={700} c="royalGold.4" mb={6}>
                MANUAL CODE LOOKUP
              </Text>
              <Group gap="xs">
                <TextInput
                  placeholder="e.g. ABDR-STALL-14-3815 or 14"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyCode(manualCode);
                  }}
                  style={{ flex: 1 }}
                  leftSection={<IconSearch size={16} color="#facc15" />}
                />
                <Button
                  onClick={() => handleVerifyCode(manualCode)}
                  loading={processing}
                  disabled={!manualCode.trim()}
                  className="btn-auspicious-gold"
                >
                  Verify
                </Button>
              </Group>
            </Paper>

            {/* Recent Scans Feed */}
            {recentScans.length > 0 && (
              <Paper
                p="md"
                radius="lg"
                style={{
                  backgroundColor: 'rgba(26, 4, 8, 0.95)',
                  border: '1px solid rgba(234, 179, 8, 0.2)',
                }}
              >
                <Text size="xs" fw={700} c="royalGold.4" mb="xs">
                  RECENT SCANS THIS SESSION ({recentScans.length})
                </Text>
                <Stack gap="xs">
                  {recentScans.map((scan, idx) => (
                    <Paper
                      key={idx}
                      p="xs"
                      radius="sm"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(234, 179, 8, 0.1)',
                      }}
                    >
                      <Group justify="space-between" align="center">
                        <Box>
                          <Text size="xs" fw={700} c="white">
                            Stall {scan.stallNumber} • {scan.brandName}
                          </Text>
                          <Text size="xs" c="gray.4">
                            {scan.bookerName} • {scan.time}
                          </Text>
                        </Box>
                        <Badge color="green" size="xs" variant="filled">
                          {scan.status}
                        </Badge>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}

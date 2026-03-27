'use client';

import { useDisclosure } from '@mantine/hooks';
import { Box, Container, Grid, GridCol, Text, Button, Group, Stack, Center, Paper } from '@mantine/core';
import { Timer, CheckCircle, QrCode, RocketIcon } from 'lucide-react';
import RegisterModal from './RegisterModal';

function StepCircle({ number, active }: { number: number; active?: boolean }) {
  return (
    <Center
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: active ? '#B8FF00' : '#1A1919',
        color: active ? '#486700' : '#B8FF00',
        fontFamily: 'var(--font-epilogue)',
        fontSize: '1.5rem',
        fontWeight: 900,
        border: active ? '4px solid #0E0E0E' : '1px solid rgba(184,255,0,0.15)',
        boxShadow: active ? '0 0 20px rgba(184,255,0,0.2)' : 'none',
        flexShrink: 0,
      }}
    >
      {number}
    </Center>
  );
}

export default function RegistrationSection() {
  const [opened, { open, close }] = useDisclosure(false);

  const steps = ['Điền Form', 'Xác Nhận', 'Hoàn Tất'];

  return (
    <>
      <Box
        component="section"
        id="registration"
        style={{ backgroundColor: '#131313', padding: '6rem 0' }}
      >
        <Container size="xl">
          {/* Section header */}
          <Group justify="space-between" align="flex-end" mb={64} wrap="wrap" gap="md">
            <Box>
              <Box style={{ width: 48, height: 4, backgroundColor: '#B8FF00', marginBottom: 16 }} />
              <Text
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  color: '#B8FF00',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                ĐĂNG KÝ THAM DỰ
              </Text>
              <Text
                component="h2"
                style={{
                  fontFamily: 'var(--font-epilogue)',
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Sẵn Sàng Chinh Phục?
              </Text>
            </Box>
            <Group gap="xs" align="center">
              <Timer size={16} color="#FF7351" />
              <Text style={{ color: '#FF7351', fontWeight: 700, fontFamily: 'var(--font-space-grotesk)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                HẠN CHÓT: 10/03/2026
              </Text>
            </Group>
          </Group>

          {/* Steps indicator */}
          <Box mb={80} style={{ maxWidth: 600, margin: '0 auto 5rem' }}>
            <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  top: 32,
                  left: '12%',
                  right: '12%',
                  height: 2,
                  backgroundColor: 'rgba(72,72,71,0.3)',
                }}
              />
              {steps.map((label, i) => (
                <Stack key={label} align="center" gap="xs" style={{ flex: 1 }}>
                  <StepCircle number={i + 1} active={i === 0} />
                  <Text
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    {label}
                  </Text>
                </Stack>
              ))}
            </Group>
          </Box>

          {/* CTA Card */}
          <Paper
            className="ghost-border"
            style={{
              backgroundColor: '#1A1919',
              borderRadius: 16,
              padding: 'clamp(2rem, 5vw, 5rem)',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            {/* Top accent line */}
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(to right, transparent, #B8FF00, transparent)',
              }}
            />

            <Grid gutter={48} align="center">
              {/* QR code side */}
              <GridCol span={{ base: 12, lg: 4 }}>
                <Stack
                  align="center"
                  style={{
                    borderRight: 'none',
                    paddingBottom: '2rem',
                  }}
                >
                  <Box
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '1rem',
                      borderRadius: 8,
                      width: 160,
                      height: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <QrCode size={80} color="#0E0E0E" />
                    <Text style={{ fontSize: '0.6rem', color: '#0E0E0E', textAlign: 'center', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Scan to register
                    </Text>
                  </Box>
                  <Text style={{ color: '#ADAAAA', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6 }}>
                    Scan QR hoặc truy cập:
                    <br />
                    <Text component="span" style={{ color: '#B8FF00', fontWeight: 700, fontSize: '1rem' }}>
                      bit.ly/nextgen-s1
                    </Text>
                  </Text>
                </Stack>
              </GridCol>

              {/* Main CTA side */}
              <GridCol span={{ base: 12, lg: 8 }}>
                <Stack align="center" gap="xl">
                  <Text
                    component="h3"
                    style={{
                      fontFamily: 'var(--font-epilogue)',
                      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    Trở thành nhà vô địch NextGen Season 1
                  </Text>
                  <Text style={{ color: '#ADAAAA', maxWidth: 480, lineHeight: 1.7 }}>
                    Hệ thống giải đấu chuyên nghiệp, tổ chức bài bản cùng đội ngũ trọng tài uy
                    tín. Đừng bỏ lỡ cơ hội khẳng định bản thân tại NextGen Season 1.
                  </Text>

                  <Button
                    onClick={open}
                    size="xl"
                    rightSection={<RocketIcon size={24} />}
                    style={{
                      backgroundColor: '#B8FF00',
                      color: '#486700',
                      fontFamily: 'var(--font-epilogue)',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      fontSize: '1.5rem',
                      padding: '1.5rem 3rem',
                      boxShadow: '0 15px 40px rgba(184,255,0,0.2)',
                      height: 'auto',
                    }}
                  >
                    ĐĂNG KÝ NGAY
                  </Button>

                  <Group gap="xl" wrap="wrap" justify="center">
                    {['Thi đấu 1vs1 & 2vs2', 'Trọng tài chuyên nghiệp', 'Giải thưởng hấp dẫn'].map(
                      (item) => (
                        <Group key={item} gap={6}>
                          <CheckCircle size={16} color="#B8FF00" />
                          <Text
                            style={{
                              fontFamily: 'var(--font-space-grotesk)',
                              fontSize: '0.8rem',
                              color: '#ADAAAA',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                            }}
                          >
                            {item}
                          </Text>
                        </Group>
                      )
                    )}
                  </Group>

                  <Box style={{ borderTop: '1px solid rgba(72,72,71,0.2)', paddingTop: '1.5rem', width: '100%' }}>
                    <Group justify="center" gap="sm" wrap="wrap">
                      <Text
                        style={{
                          color: '#FF7351',
                          fontWeight: 700,
                          fontFamily: 'var(--font-space-grotesk)',
                          fontSize: '0.7rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Cổng đăng ký sẽ đóng sau:
                      </Text>
                      <Text
                        className="neon-glow"
                        style={{
                          fontFamily: 'var(--font-epilogue)',
                          fontStyle: 'italic',
                          fontSize: '1.2rem',
                          color: '#FFFFFF',
                          fontWeight: 900,
                        }}
                      >
                        23:59 · 10.03.2026
                      </Text>
                    </Group>
                  </Box>
                </Stack>
              </GridCol>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <RegisterModal opened={opened} onClose={close} />
    </>
  );
}

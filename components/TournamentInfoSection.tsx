'use client';

import { Box, Container, Grid, GridCol, Text, Paper, Stack, Group, Badge } from '@mantine/core';
import { CalendarDays, MapPin, Clock, Building2 } from 'lucide-react';

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Group
      justify="space-between"
      py="sm"
      style={{ borderBottom: '1px solid rgba(72,72,71,0.3)' }}
    >
      <Text
        style={{
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#ADAAAA',
        }}
      >
        {label}
      </Text>
      <Text style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem' }}>{value}</Text>
    </Group>
  );
}

export default function TournamentInfoSection() {
  return (
    <Box
      component="section"
      id="tournament-info"
      style={{ backgroundColor: '#131313', padding: '6rem 0', position: 'relative' }}
    >
      <Container size="xl">
        {/* Section header */}
        <Box mb={64}>
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
            THÔNG TIN GIẢI ĐẤU
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
            Thời Gian &amp; Địa Điểm
          </Text>
        </Box>

        <Grid gutter="xl">
          {/* Time card */}
          <GridCol span={{ base: 12, md: 6 }}>
            <Paper
              className="ghost-border"
              style={{
                backgroundColor: '#1A1919',
                borderRadius: 12,
                padding: '2.5rem',
                height: '100%',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#201F1F')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1919')}
            >
              <Group justify="space-between" align="flex-start" mb={40}>
                <Box
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(184,255,0,0.1)',
                    borderRadius: 8,
                  }}
                >
                  <CalendarDays size={28} color="#B8FF00" />
                </Box>
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: 'rgba(184,255,0,0.1)',
                    borderColor: 'rgba(184,255,0,0.2)',
                    color: '#B8FF00',
                    fontFamily: 'var(--font-space-grotesk)',
                    letterSpacing: '0.1em',
                    fontSize: '0.6rem',
                  }}
                >
                  UPCOMING
                </Badge>
              </Group>
              <Text
                component="h3"
                style={{
                  fontFamily: 'var(--font-epilogue)',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  marginBottom: '1.5rem',
                }}
              >
                Thời Gian Thi Đấu
              </Text>
              <Stack gap={0}>
                <InfoRow label="Ngày thi đấu" value="15 - 16 / 03 / 2026" />
                <InfoRow label="Check-in" value="07:00 AM" />
                <InfoRow label="Khai mạc" value="08:00 AM" />
                <Group justify="space-between" pt="sm">
                  <Text
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#ADAAAA',
                    }}
                  >
                    Kết thúc
                  </Text>
                  <Text style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem' }}>
                    06:00 PM
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </GridCol>

          {/* Venue card */}
          <GridCol span={{ base: 12, md: 6 }}>
            <Box
              className="ghost-border"
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                minHeight: 420,
              }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1eQSROKYoouBgQAu2u-hWzMWRun0dj9KIzdSGcA-yKNBSJ61aR-Z7l2t82E4AqchdvwlaS-LkhR8fIJpE9sk66L3ZkX_iVx18u5lStBKd-fwXRb9HN2u_uKQ6TF3wbLyPuNOmzxjiXCs4pOFYSPI_jHmUNUAekH2pemN6Qw7UZV-8A8KmADMiZE4-atrPbhJmBEgEb4zy7hlHytY9ocPWFxyoHkM_HKSNQwc9g_0fQFE2TP1NoBApMhU7J2Sy72e7_EPNhpU-Ah2P"
                alt="Modern Pickleball Arena"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, #0E0E0E, rgba(14,14,14,0.6), transparent)',
                }}
              />
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '2.5rem',
                }}
              >
                <Group gap="md" mb={24}>
                  <Box
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#B8FF00',
                      borderRadius: 8,
                      boxShadow: '0 0 20px rgba(184,255,0,0.4)',
                    }}
                  >
                    <MapPin size={22} color="#486700" />
                  </Box>
                  <Text
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      color: '#B8FF00',
                      textTransform: 'uppercase',
                    }}
                  >
                    Tournament Venue
                  </Text>
                </Group>
                <Text
                  component="h3"
                  className="neon-glow"
                  style={{
                    fontFamily: 'var(--font-epilogue)',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#FFFFFF',
                    marginBottom: '1.5rem',
                  }}
                >
                  NextGen Arena District 7
                </Text>
                <Grid gutter="sm">
                  <GridCol span={6}>
                    <Box
                      style={{
                        backgroundColor: 'rgba(14,14,14,0.8)',
                        backdropFilter: 'blur(10px)',
                        padding: '1rem',
                        borderRadius: 8,
                        border: '1px solid rgba(72,72,71,0.3)',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'var(--font-space-grotesk)',
                          fontSize: '0.6rem',
                          color: 'rgba(184,255,0,0.7)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          marginBottom: 4,
                        }}
                      >
                        Quy mô
                      </Text>
                      <Text style={{ fontWeight: 700, color: '#FFFFFF' }}>8 Sân thi đấu</Text>
                    </Box>
                  </GridCol>
                  <GridCol span={6}>
                    <Box
                      style={{
                        backgroundColor: 'rgba(14,14,14,0.8)',
                        backdropFilter: 'blur(10px)',
                        padding: '1rem',
                        borderRadius: 8,
                        border: '1px solid rgba(72,72,71,0.3)',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'var(--font-space-grotesk)',
                          fontSize: '0.6rem',
                          color: 'rgba(184,255,0,0.7)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          marginBottom: 4,
                        }}
                      >
                        Loại sân
                      </Text>
                      <Text style={{ fontWeight: 700, color: '#FFFFFF' }}>Indoor Hard Court</Text>
                    </Box>
                  </GridCol>
                </Grid>
                <Group gap="xs" mt={16}>
                  <MapPin size={14} color="#ADAAAA" />
                  <Text style={{ fontSize: '0.85rem', color: '#ADAAAA' }}>
                    TP. Hồ Chí Minh, Việt Nam
                  </Text>
                </Group>
              </Box>
            </Box>
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}

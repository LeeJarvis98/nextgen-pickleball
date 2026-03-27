'use client';

import { Box, Container, Grid, GridCol, Text, Button, Group, Stack, Image } from '@mantine/core';
import { ArrowRight, Info } from 'lucide-react';

export default function HeroSection() {
  return (
    <Box
      component="section"
      className="diagonal-texture"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#0E0E0E',
      }}
    >
      {/* Gradient overlay */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(14,14,14,0.5), #0E0E0E)',
          pointerEvents: 'none',
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 10, width: '100%' }} py={80}>
        <Grid gutter="xl" align="center">
          <GridCol span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
              {/* Season badge */}
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderLeft: '2px solid #B8FF00',
                  paddingLeft: '1rem',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    color: '#B8FF00',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                  }}
                >
                  SEASON 1 · 2026
                </Text>
              </Box>

              {/* Headline */}
              <Box>
                <Text
                  component="h1"
                  style={{
                    fontFamily: 'var(--font-epilogue)',
                    fontSize: 'clamp(3.5rem, 10vw, 8rem)',
                    lineHeight: 0.9,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#FFFFFF',
                    display: 'block',
                    margin: 0,
                  }}
                >
                  NEXTGEN
                </Text>
                <Text
                  component="span"
                  style={{
                    fontFamily: 'var(--font-epilogue)',
                    fontSize: 'clamp(3.5rem, 10vw, 8rem)',
                    lineHeight: 0.9,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#B8FF00',
                    display: 'block',
                  }}
                >
                  PICKLEBALL SERIES
                </Text>
              </Box>

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: '1.1rem',
                  color: '#ADAAAA',
                  maxWidth: '600px',
                  lineHeight: 1.6,
                }}
              >
                Vietnam&apos;s Premier Pickleball Tournament. Experience the high-velocity precision
                of the pro-circuit in a high-performance environment.
              </Text>

              {/* CTAs */}
              <Group gap="md" wrap="wrap">
                <Button
                  component="a"
                  href="#registration"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#registration')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="lg"
                  rightSection={<ArrowRight size={18} />}
                  style={{
                    background: 'linear-gradient(135deg, #ACEE00, #B8FF00)',
                    color: '#486700',
                    fontFamily: 'var(--font-space-grotesk)',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    boxShadow: '0 0 30px rgba(184,255,0,0.15)',
                  }}
                >
                  ĐĂNG KÝ NGAY
                </Button>
                <Button
                  component="a"
                  href="#tournament-info"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector('#tournament-info')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="lg"
                  variant="outline"
                  className="ghost-border"
                  style={{
                    color: '#B8FF00',
                    borderColor: 'rgba(184,255,0,0.15)',
                    fontFamily: 'var(--font-space-grotesk)',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    backgroundColor: 'rgba(26,25,25,0.5)',
                  }}
                  leftSection={<Info size={18} />}
                >
                  XEM THÔNG TIN
                </Button>
              </Group>
            </Stack>
          </GridCol>

          {/* Hero image */}
          <GridCol span={{ base: 0, lg: 4 }} visibleFrom="lg">
            <Box style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  inset: '-1rem',
                  backgroundColor: 'rgba(184,255,0,0.1)',
                  filter: 'blur(40px)',
                  borderRadius: '50%',
                }}
              />
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2wV7EYRRs4Hd5hlvF6QNau1-hZn9Dwo_QjoeWKKW8LyltcmkjtgMNdLRMoxpZ_-E0GgndkHeozcxesTu6N86HSteNSDNtsJ9wmcsOUbhVyUUjNYOAJDD5gtqWxzufd3tiffrLqptBL45BwOZhyKC0Gilr7eno4T9k-ulpijqisaHoBJf8MVGdpszXWy_GHn1nPdK6cDe8lO5VGvHt2NCnJas84Rnnbmt_cWqQAnaxH5u6jX6LGayQd1dzjNhNTuHhylBNu3XVUs0w"
                alt="Pickleball Action"
                radius="md"
                className="ghost-border"
                style={{
                  position: 'relative',
                  zIndex: 10,
                  objectFit: 'cover',
                  aspectRatio: '3/4',
                  filter: 'grayscale(100%)',
                  transition: 'filter 0.7s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'grayscale(0%)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'grayscale(100%)')}
              />
            </Box>
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}

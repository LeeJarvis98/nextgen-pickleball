import { Box, Container, Grid, GridCol, Text, Paper, Stack, Center } from '@mantine/core';
import { Trophy, Medal, Award } from 'lucide-react';

interface PrizePodiumProps {
  rank: number;
  title: string;
  amount: string;
  icon: React.ReactNode;
  highlight?: boolean;
  borderColor?: string;
  iconBorderColor?: string;
}

function PrizePodium({
  title,
  amount,
  icon,
  highlight,
  borderColor,
  iconBorderColor,
}: PrizePodiumProps) {
  return (
    <Paper
      className="ghost-border"
      style={{
        backgroundColor: highlight ? '#201F1F' : '#1A1919',
        borderRadius: 12,
        padding: highlight ? '2.5rem' : '2rem',
        borderTop: `4px solid ${borderColor ?? 'rgba(255,255,255,0.2)'}`,
        position: 'relative',
        marginTop: highlight ? 0 : 32,
        transform: highlight ? 'scale(1.05)' : 'scale(1)',
        zIndex: highlight ? 20 : 1,
        boxShadow: highlight ? '0 10px 50px rgba(0,0,0,0.5)' : 'none',
        textAlign: 'center',
      }}
    >
      <Center
        style={{
          position: 'absolute',
          top: highlight ? -32 : -24,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: highlight ? '#201F1F' : '#1A1919',
          padding: highlight ? '1rem' : '0.75rem',
          borderRadius: '50%',
          border: `1px solid ${iconBorderColor ?? 'rgba(255,255,255,0.3)'}`,
        }}
      >
        {icon}
      </Center>
      <Text
        component="h4"
        style={{
          fontFamily: 'var(--font-epilogue)',
          fontSize: highlight ? '1.5rem' : '1.2rem',
          fontWeight: 900,
          color: '#FFFFFF',
          marginTop: '1.5rem',
          marginBottom: '0.5rem',
          fontStyle: 'italic',
        }}
      >
        {title}
      </Text>
      <Text
        className={highlight ? 'neon-glow' : ''}
        style={{
          fontFamily: 'var(--font-epilogue)',
          fontSize: highlight ? '2rem' : '1.6rem',
          fontWeight: 900,
          fontStyle: 'italic',
          color: highlight ? '#B8FF00' : '#ADAAAA',
        }}
      >
        {amount}
      </Text>
      {highlight && (
        <Text
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '0.6rem',
            color: 'rgba(184,255,0,0.6)',
            marginTop: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          + CUP &amp; HUY CHƯƠNG VÀNG
        </Text>
      )}
    </Paper>
  );
}

export default function PrizesSection() {
  return (
    <Box
      component="section"
      id="prizes"
      style={{
        backgroundColor: '#0E0E0E',
        padding: '6rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 384,
          height: 384,
          backgroundColor: 'rgba(184,255,0,0.05)',
          filter: 'blur(120px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Stack align="center" mb={64}>
          <Box style={{ width: 48, height: 4, backgroundColor: '#B8FF00' }} />
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
            GIẢI THƯỞNG
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
              textAlign: 'center',
            }}
          >
            Tổng Giải Thưởng
          </Text>
        </Stack>

        {/* Total prize */}
        <Center mb={80}>
          <Text
            className="neon-glow"
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 900,
              color: '#B8FF00',
              fontStyle: 'italic',
              lineHeight: 1,
              textAlign: 'center',
            }}
          >
            10.000.000 VNĐ
          </Text>
        </Center>

        {/* Podium */}
        <Grid gutter="xl" align="flex-end">
          <GridCol span={{ base: 12, md: 4 }} order={{ base: 2, md: 1 }}>
            <PrizePodium
              rank={2}
              title="Á Quân"
              amount="3,000,000 VNĐ"
              borderColor="rgba(173,170,170,0.5)"
              iconBorderColor="rgba(173,170,170,0.3)"
              icon={<Medal size={32} color="#ADAAAA" />}
            />
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }} order={{ base: 1, md: 2 }}>
            <PrizePodium
              rank={1}
              title="Vô Địch"
              amount="5,000,000 VNĐ"
              highlight
              borderColor="#B8FF00"
              iconBorderColor="rgba(184,255,0,0.3)"
              icon={<Trophy size={40} color="#B8FF00" />}
            />
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }} order={{ base: 3, md: 3 }}>
            <PrizePodium
              rank={3}
              title="Hạng 3"
              amount="2,000,000 VNĐ"
              borderColor="rgba(205,127,50,0.5)"
              iconBorderColor="rgba(205,127,50,0.2)"
              icon={<Award size={32} color="#CD7F32" />}
            />
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}

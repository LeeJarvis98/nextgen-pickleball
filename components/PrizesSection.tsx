import { Box, Container, Grid, GridCol, Stack, Center } from '@mantine/core';
import { Trophy, Medal, Award } from 'lucide-react';
import styles from './PrizesSection.module.css';

interface PrizePodiumProps {
  rank: number;
  title: string;
  amount: string;
  icon: React.ReactNode;
  highlight?: boolean;
  borderColor?: string;
  iconBorderColor?: string;
}

function PrizePodium({ title, amount, icon, highlight, borderColor, iconBorderColor }: PrizePodiumProps) {
  return (
    <Box
      className={`ghost-border ${styles.podium} ${highlight ? styles.podiumHighlight : styles.podiumDefault}`}
      style={{ borderTop: `4px solid ${borderColor ?? 'rgba(255,255,255,0.2)'}` }}
    >
      <Center
        className={`${styles.podiumIconCenter} ${highlight ? styles.podiumIconCenterHighlight : styles.podiumIconCenterDefault}`}
        style={{ border: `1px solid ${iconBorderColor ?? 'rgba(255,255,255,0.3)'}` }}
      >
        {icon}
      </Center>
      <h4
        className={`${styles.podiumTitle} ${highlight ? styles.podiumTitleHighlight : styles.podiumTitleDefault}`}
      >
        {title}
      </h4>
      <span
        className={`${highlight ? 'neon-glow' : ''} ${styles.podiumAmount} ${highlight ? styles.podiumAmountHighlight : styles.podiumAmountDefault}`}
      >
        {amount}
      </span>
      {highlight && (
        <p className={styles.podiumBonus}>+ CUP &amp; HUY CHƯƠNG VÀNG</p>
      )}
    </Box>
  );
}

export default function PrizesSection() {
  return (
    <Box component="section" id="prizes" className={styles.section}>
      <Box className={styles.glow} />

      <Container size="xl" style={{ position: 'relative', zIndex: 10 }}>
        <Stack align="center" mb={64}>
          <Box className={styles.accentBar} />
          <span className={styles.sectionLabel}>GIẢI THƯỞNG</span>
          <h2 className={styles.sectionTitle}>Tổng Giải Thưởng</h2>
        </Stack>

        <Center mb={80}>
          <span className={`neon-glow ${styles.totalPrize}`}>10.000.000 VNĐ</span>
        </Center>

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
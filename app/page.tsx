import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TournamentInfoSection from '@/components/TournamentInfoSection';
import Footer from '@/components/Footer';

// Force server-render on every request so slot counts are always fresh from the DB.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TournamentInfoSection />
      </main>
      <Footer />
    </>
  );
}

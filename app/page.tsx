import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TournamentInfoSection from '@/components/TournamentInfoSection';
import Footer from '@/components/Footer';

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

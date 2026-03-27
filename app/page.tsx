import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TournamentInfoSection from '@/components/TournamentInfoSection';
import PrizesSection from '@/components/PrizesSection';
import RegistrationSection from '@/components/RegistrationSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TournamentInfoSection />
        <PrizesSection />
        <RegistrationSection />
      </main>
      <Footer />
    </>
  );
}

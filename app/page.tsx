import About from '@/components/About';
import BanyaCursor from '@/components/BanyaCursor';
import Contacts from '@/components/Contacts';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import InfoBar from '@/components/InfoBar';
import MobileBar from '@/components/MobileBar';
import Prices from '@/components/Prices';
import Reveal from '@/components/Reveal';
import Schedule from '@/components/Schedule';
import Services from '@/components/Services';
import SmoothScroll from '@/components/SmoothScroll';

export default function HomePage() {
  return (
    <>
      <BanyaCursor />
      <SmoothScroll />
      <Reveal />

      <Header />

      <main>
        <Hero />
        <InfoBar />
        <Schedule />
        <Services />
        <Gallery />
        <About />
        <Prices />
        <Contacts />
      </main>

      <Footer />
      <MobileBar />
    </>
  );
}

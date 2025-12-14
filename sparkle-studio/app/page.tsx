import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductHighlight from './components/ProductHighlight';
import CustomerVendorSelection from './components/CustomerVendorSelection';

export default function LandingPage() {
  return (
    <div className="snap-scroll-container bg-[#000000]">
      <Navbar />
      <HeroSection />
      <ProductHighlight />
      <CustomerVendorSelection />
    </div>
  );
}

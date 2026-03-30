import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SocialProofBar from "@/components/SocialProofBar";
import FeaturedExperiencesSection from "@/components/FeaturedExperiencesSection";
import SignatureBundlesSection from "@/components/SignatureBundlesSection";
import GroupCalloutSection from "@/components/GroupCalloutSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PrivateInquirySection from "@/components/PrivateInquirySection";
import DiscretionCommitment from "@/components/DiscretionCommitment";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <FeaturedExperiencesSection />
      <SignatureBundlesSection />
      <GroupCalloutSection />
      <ServicesSection />
      <HowItWorksSection />
      <PrivateInquirySection />
      <DiscretionCommitment />
      <CTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;

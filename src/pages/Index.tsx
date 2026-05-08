import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SocialProofBar from "@/components/SocialProofBar";
import FeaturedExperiencesSection from "@/components/FeaturedExperiencesSection";
import F1WeekendSection from "@/components/F1WeekendSection";

import GroupCalloutSection from "@/components/GroupCalloutSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PrivateInquirySection from "@/components/PrivateInquirySection";
import DiscretionCommitment from "@/components/DiscretionCommitment";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Platinum Circle — Luxury VIP Concierge & Private Members Club"
        description="World-class VIP concierge for luxury homes, elite drivers, curated experiences, and private security. Discreet, members-only access in Montreal, Dubai, Paris, and beyond."
        keywords="luxury concierge, VIP members club, private villa rentals, elite chauffeur, F1 Montreal Grand Prix, bachelor party VIP, private security"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Platinum Circle",
          url: "https://platinumcircle.ca",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://platinumcircle.ca/experiences/{search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <FeaturedExperiencesSection />
      <F1WeekendSection />
      
      <GroupCalloutSection />
      <ServicesSection />
      <HowItWorksSection />
      <PrivateInquirySection />
      <DiscretionCommitment />
      <CTASection />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;

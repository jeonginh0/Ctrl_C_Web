import React from "react";
import HeroSection from "@/components/containers/Home/HeroSection";
import FeatureSection from "@/components/containers/Home/FeatureSection";
import InfoSection from "@/components/containers/Home/InfoSection";

const Home: React.FC = () => {
    return (
        <main>
            <HeroSection />
            <FeatureSection />
            <InfoSection />
        </main>
    );
}

export default Home;
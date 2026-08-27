import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { IntroSection } from '@/components/home/IntroSection';
import { BuildingLoopSection } from '@/components/home/BuildingLoopSection';
import { FeaturedProjectsSection } from '@/components/home/FeaturedProjectsSection';
import { BuildersSection } from '@/components/home/BuildersSection';
import { OpportunitiesSection } from '@/components/home/OpportunitiesSection';
import { UpcomingEventsSection } from '@/components/home/UpcomingEventsSection';
import { CareersSection } from '@/components/home/CareersSection';
import { BuiltBySection } from '@/components/home/BuiltBySection';

export default function HomePage() {
  return (
    <>
      {/* 01 — HERO */}
      <HeroSection />

      {/* 02 — WHAT IS MADE? */}
      <IntroSection />

      {/* 03 — THE BUILDING LOOP */}
      <BuildingLoopSection />

      {/* 04 — FEATURED PROJECTS */}
      <FeaturedProjectsSection />

      {/* 05 — BUILDERS */}
      <BuildersSection />

      {/* 06 — OPPORTUNITIES */}
      <OpportunitiesSection />

      {/* 07 — UPCOMING EVENTS */}
      <UpcomingEventsSection />

      {/* 08 — CAREERS */}
      <CareersSection />

      {/* 09 — BUILT BY */}
      <BuiltBySection />
    </>
  );
}

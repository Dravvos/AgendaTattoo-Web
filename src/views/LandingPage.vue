<script setup lang="ts">
import AppHeader from '../components/landing/AppHeader.vue'
import HeroSection from '../components/landing/HeroSection.vue'
import FeaturesSection from '../components/landing/FeaturesSection.vue'
import HowItWorksSection from '../components/landing/HowItWorksSection.vue'
import CtaSection from '../components/landing/CtaSection.vue'
import AppFooter from '../components/landing/AppFooter.vue'
</script>

<template>
  <div class="landing">
    <AppHeader />
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </main>
    <AppFooter />
  </div>
</template>

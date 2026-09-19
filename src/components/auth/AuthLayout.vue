<script setup lang="ts">
import LogoMark from '../landing/LogoMark.vue';
</script>

<template>
  <div class="auth-layout">
    <aside class="auth-brand">
      <router-link to="/" class="auth-brand__logo">
        <LogoMark :size="26" />
        <span>Flashbook</span>
      </router-link>

      <div class="auth-brand__body">
        <p class="auth-brand__quote">
          &ldquo;Menos tempo confirmando horário pelo WhatsApp, mais tempo
          tatuando.&rdquo;
        </p>
      </div>

      <router-link to="/" class="auth-brand__back">← Voltar para o site</router-link>
    </aside>

    <main class="auth-content">
      <div class="auth-card">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  background: var(--paper-100);
}

.auth-brand {
  background: var(--ink-900);
  color: var(--text-on-ink);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.auth-brand__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-on-ink);
  font-family: var(--font-display);
  font-size: 20px;
}

.auth-brand__body {
  display: flex;
  align-items: center;
}

.auth-brand__quote {
  font-family: var(--font-display);
  font-size: clamp(24px, 2.4vw, 30px);
  line-height: 1.25;
  color: var(--paper-100);
  max-width: 20ch;
}

.auth-brand__back {
  font-size: 14px;
  color: var(--text-on-ink-muted);
  text-decoration: none;
  width: fit-content;
}

.auth-brand__back:hover {
  color: var(--text-on-ink);
}

.auth-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

@media (max-width: 860px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    padding: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .auth-brand__body,
  .auth-brand__back {
    display: none;
  }
}
</style>

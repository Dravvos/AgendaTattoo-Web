<script setup lang="ts">
import Button from 'primevue/button'
import LogoMark from './LogoMark.vue'
</script>

<template>
  <header class="site-header">
    <div class="container site-header__row">
      <router-link to="/" class="brand" aria-label="Flashbook — página inicial">
        <LogoMark :size="28" />
        <span class="brand__word">Flashbook</span>
      </router-link>

      <nav class="nav-links" aria-label="Navegação principal">
        <a href="#recursos">Recursos</a>
        <a href="#como-funciona">Como funciona</a>
      </nav>

      <div class="site-header__actions">
        <router-link to="/login" class="link-button">Entrar</router-link>
        <router-link to="/cadastro">
          <Button label="Criar conta" size="small" />
        </router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--ink-900) 92%, transparent);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--line-on-ink);
}

.site-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 72px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-on-ink);
  text-decoration: none;
}

.brand__word {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  font-size: 15px;
}

.nav-links a {
  color: var(--text-on-ink-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.nav-links a:hover {
  color: var(--text-on-ink);
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.link-button {
  color: var(--text-on-ink);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
}

.link-button:hover {
  color: var(--brass-300);
}

@media (max-width: 760px) {
  .nav-links {
    display: none;
  }
}
</style>

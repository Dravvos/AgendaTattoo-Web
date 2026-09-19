<script setup lang="ts">
import LogoMark from './LogoMark.vue';

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer__row">
      <div class="footer__brand">
        <LogoMark :size="22" />
        <span>Flashbook</span>
      </div>

      <nav class="footer__links" aria-label="Links do rodapé">
        <a href="#recursos">Recursos</a>
        <a href="#como-funciona">Como funciona</a>
        <router-link to="/login">Entrar</router-link>
        <router-link to="/cadastro">Criar conta</router-link>
      </nav>

      <p class="footer__copy">© {{ year }} Flashbook. Agenda para estúdios de tatuagem.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 40px 0;
  border-top: 1px solid var(--line-on-ink);
}

.footer__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 17px;
  color: var(--text-on-ink);
}

.footer__links {
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.footer__links a {
  color: var(--text-on-ink-muted);
  text-decoration: none;
}

.footer__links a:hover {
  color: var(--text-on-ink);
}

.footer__copy {
  font-size: 13px;
  color: var(--text-on-ink-muted);
  width: 100%;
  order: 3;
}

@media (min-width: 760px) {
  .footer__copy {
    width: auto;
    order: 0;
  }
}
</style>

<script setup lang="ts">
import Button from 'primevue/button'
</script>

<template>
  <section class="cta section">
    <div class="container cta__inner">
      <h2 class="cta__title">Pronto para tirar sua agenda do WhatsApp?</h2>
      <p class="cta__subtitle">
        Comece a organizar o agendamento do seu estúdio hoje. Sem cartão de
        crédito para criar a conta.
      </p>
      <router-link to="/cadastro">
        <Button label="Criar conta grátis" size="large" />
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.cta {
  background: var(--paper-100);
  color: var(--text-on-paper);
}

.cta__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta__title {
  font-size: clamp(30px, 4vw, 44px);
  color: var(--text-on-paper);
  max-width: 18ch;
}

.cta__subtitle {
  margin-top: 18px;
  font-size: 17px;
  color: var(--text-on-paper-muted);
  max-width: 44ch;
}

.cta__inner > a {
  margin-top: 32px;
}
</style>

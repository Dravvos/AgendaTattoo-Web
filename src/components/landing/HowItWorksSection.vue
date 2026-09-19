<script setup lang="ts">
const steps = [
  {
    number: '1',
    title: 'Crie a conta do seu estúdio',
    description:
      'Cadastre o estúdio, os artistas e configure os horários disponíveis para agendamento.',
  },
  {
    number: '2',
    title: 'Compartilhe o link com os clientes',
    description:
      'Cada cliente agenda, preenche a ficha de anamnese e paga o sinal sozinho, pelo link público.',
  },
  {
    number: '3',
    title: 'Acompanhe a agenda da semana',
    description:
      'Confirme, remarque ou cancele sessões sem precisar cruzar conversa por conversa no WhatsApp.',
  },
]
</script>

<template>
  <section id="como-funciona" class="how section">
    <div class="container">
      <h2 class="how__title">Como funciona</h2>

      <ol class="how__steps">
        <li v-for="step in steps" :key="step.number" class="how-step">
          <span class="how-step__number">{{ step.number }}</span>
          <h3 class="how-step__title">{{ step.title }}</h3>
          <p class="how-step__description">{{ step.description }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.how__title {
  font-size: clamp(30px, 3.6vw, 40px);
  color: var(--text-on-ink);
}

.how__steps {
  margin: 56px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.how-step {
  padding-top: 20px;
  border-top: 1px solid var(--line-on-ink);
}

.how-step__number {
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--brass-400);
}

.how-step__title {
  margin-top: 14px;
  font-family: var(--font-body);
  font-size: 19px;
  font-weight: 600;
  color: var(--text-on-ink);
}

.how-step__description {
  margin-top: 10px;
  font-size: 15px;
  color: var(--text-on-ink-muted);
  max-width: 34ch;
}

@media (max-width: 760px) {
  .how__steps {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>

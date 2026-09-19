<script setup lang="ts">
const features = [
  {
    title: 'Link de agendamento público',
    description:
      'O cliente marca o horário direto pelo link do estúdio, sem precisar criar conta nem baixar aplicativo.',
  },
  {
    title: 'Ficha de anamnese digital',
    description:
      'Histórico de saúde e termo de consentimento são preenchidos pelo cliente antes da sessão, prontos no perfil dele.',
  },
  {
    title: 'Vários tatuadores, uma agenda só',
    description:
      'Cada estúdio organiza seus artistas e horários de forma isolada dos outros estúdios que usam a plataforma.',
  },
  {
    title: 'Sinal para reduzir faltas',
    description:
      'Cobrança antecipada de sinal no momento da confirmação, para desencorajar cancelamentos de última hora.',
  },
  {
    title: 'Lembretes automáticos',
    description:
      'O cliente recebe aviso antes da sessão sem o estúdio precisar lembrar manualmente pelo WhatsApp.',
  },
  {
    title: 'Painel da semana',
    description:
      'Uma visão simples dos próximos atendimentos, sem precisar cruzar conversas e anotações espalhadas.',
  },
]
</script>

<template>
  <section id="recursos" class="features section">
    <div class="container">
      <h2 class="features__title">O que o estúdio ganha</h2>
      <p class="features__intro">
        O essencial para tirar o agendamento do WhatsApp e organizar a rotina
        do estúdio em um único lugar.
      </p>

      <div class="features__grid">
        <article v-for="feature in features" :key="feature.title" class="feature-card">
          <h3 class="feature-card__title">{{ feature.title }}</h3>
          <p class="feature-card__description">{{ feature.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  background: var(--ink-800);
  border-top: 1px solid var(--line-on-ink);
  border-bottom: 1px solid var(--line-on-ink);
}

.features__title {
  font-size: clamp(30px, 3.6vw, 40px);
  color: var(--text-on-ink);
  max-width: 16ch;
}

.features__intro {
  margin-top: 16px;
  font-size: 17px;
  color: var(--text-on-ink-muted);
  max-width: 52ch;
}

.features__grid {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1px;
  background: var(--line-on-ink);
  border: 1px solid var(--line-on-ink);
}

.feature-card {
  background: var(--ink-800);
  padding: 32px 28px;
}

.feature-card__title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-on-ink);
}

.feature-card__description {
  margin-top: 10px;
  font-size: 15px;
  color: var(--text-on-ink-muted);
}
</style>

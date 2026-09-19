<script setup lang="ts">
import Button from 'primevue/button'

const flashItems = [
  { label: 'Agenda pública', icon: 'link' },
  { label: 'Ficha de anamnese', icon: 'clipboard' },
  { label: 'Sinal antecipado', icon: 'coin' },
  { label: 'Lembrete automático', icon: 'bell' },
]
</script>

<template>
  <section class="hero">
    <div class="container hero__grid">
      <div class="hero__copy">
        <h1 class="hero__title">
          A agenda do seu estúdio, sem bagunça de WhatsApp
        </h1>
        <p class="hero__subtitle">
          Flashbook reúne agendamento por link público, ficha de anamnese
          digital e cobrança de sinal em um só lugar — para o estúdio gastar
          menos tempo confirmando horário e ter menos furo de agenda.
        </p>
        <div class="hero__actions">
          <router-link to="/cadastro">
            <Button label="Criar conta grátis" size="large" />
          </router-link>
          <a href="#como-funciona" class="hero__secondary-link">
            Ver como funciona
          </a>
        </div>
      </div>

      <div class="hero__visual" aria-hidden="true">
        <div class="flash-card">
          <span class="flash-card__pin"></span>
          <div class="flash-card__grid">
            <div v-for="item in flashItems" :key="item.label" class="flash-slot">
              <svg
                v-if="item.icon === 'link'"
                viewBox="0 0 24 24"
                class="flash-slot__icon"
              >
                <path
                  d="M9.5 14.5 14.5 9.5M8 7 6.5 5.5a3 3 0 0 1 4.24-4.24L12 2.5M16 17l1.5 1.5a3 3 0 0 1-4.24 4.24L12 21.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  transform="translate(0 -0.5)"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'clipboard'"
                viewBox="0 0 24 24"
                class="flash-slot__icon"
              >
                <rect
                  x="5.5"
                  y="4"
                  width="13"
                  height="17"
                  rx="1.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                />
                <path
                  d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                />
                <path
                  d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4.5"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
              <svg
                v-else-if="item.icon === 'coin'"
                viewBox="0 0 24 24"
                class="flash-slot__icon"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                />
                <path
                  d="M12 7.8v8.4M9.7 15.1c.3.8 1.1 1.2 2.3 1.2 1.5 0 2.5-.7 2.5-1.8 0-2.4-4.8-1.1-4.8-3.5 0-1.1 1-1.8 2.5-1.8 1.1 0 1.9.4 2.2 1.1"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" class="flash-slot__icon">
                <path
                  d="M6 17h12l-1.4-2V11a4.6 4.6 0 0 0-9.2 0v4L6 17Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.4 19.5a1.8 1.8 0 0 0 3.2 0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
              </svg>
              <span class="flash-slot__label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 72px 0 104px;
}

.hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 64px;
  align-items: center;
}

.hero__title {
  font-size: clamp(38px, 5.4vw, 62px);
  color: var(--text-on-ink);
  max-width: 15ch;
}

.hero__subtitle {
  margin-top: 24px;
  font-size: 18px;
  color: var(--text-on-ink-muted);
  max-width: 46ch;
}

.hero__actions {
  margin-top: 36px;
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.hero__secondary-link {
  color: var(--text-on-ink);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid var(--line-on-ink);
  padding-bottom: 2px;
  transition: border-color 0.15s ease;
}

.hero__secondary-link:hover {
  border-color: var(--brass-400);
}

.hero__visual {
  display: flex;
  justify-content: center;
}

.flash-card {
  position: relative;
  background: var(--paper-100);
  color: var(--text-on-paper);
  width: min(100%, 380px);
  padding: 36px 28px 28px;
  border: 1px solid var(--paper-300);
  box-shadow: var(--shadow-card);
  transform: rotate(-2deg);
}

.flash-card__pin {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--brass-500);
  box-shadow: 0 3px 6px rgba(23, 20, 15, 0.35);
}

.flash-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.flash-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 18px 8px;
  border: 1px solid var(--line-on-paper);
}

.flash-slot__icon {
  width: 30px;
  height: 30px;
  color: var(--brass-600);
}

.flash-slot__label {
  font-size: 13px;
  color: var(--text-on-paper-muted);
  line-height: 1.3;
}

@media (max-width: 900px) {
  .hero__grid {
    grid-template-columns: 1fr;
  }

  .hero__visual {
    order: -1;
  }

  .flash-card {
    transform: none;
  }
}
</style>

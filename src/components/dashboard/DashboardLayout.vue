<script setup lang="ts">
import LogoMark from '../landing/LogoMark.vue'

// Placeholder até a sessão/login estarem ligados a uma API de verdade.
const currentStudioName = 'Estúdio Tinta & Agulha'

const navItems = [
  { label: 'Agenda', to: '/agenda', enabled: true },
  { label: 'Clientes', to: '#', enabled: false },
  { label: 'Configurações', to: '#', enabled: false },
]
</script>

<template>
  <div class="dashboard">
    <aside class="dashboard-sidebar">
      <router-link to="/" class="dashboard-sidebar__brand">
        <LogoMark :size="26" />
        <span>Flashbook</span>
      </router-link>

      <nav class="dashboard-nav" aria-label="Navegação do painel">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="dashboard-nav__item"
          :class="{ 'dashboard-nav__item--disabled': !item.enabled }"
          :aria-disabled="!item.enabled"
        >
          {{ item.label }}
          <span v-if="!item.enabled" class="dashboard-nav__badge">em breve</span>
        </router-link>
      </nav>

      <div class="dashboard-sidebar__footer">
        <p class="dashboard-sidebar__studio">{{ currentStudioName }}</p>
        <router-link to="/" class="dashboard-sidebar__logout">Sair</router-link>
      </div>
    </aside>

    <main class="dashboard-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
  background: var(--paper-100);
}

.dashboard-sidebar {
  background: var(--ink-900);
  color: var(--text-on-ink);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.dashboard-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-on-ink);
  font-family: var(--font-display);
  font-size: 19px;
}

.dashboard-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.dashboard-nav__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-on-ink-muted);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
}

.dashboard-nav__item:hover {
  background: var(--ink-800);
  color: var(--text-on-ink);
}

.dashboard-nav__item.router-link-active {
  background: var(--ink-800);
  color: var(--brass-300);
}

.dashboard-nav__item--disabled {
  pointer-events: none;
  opacity: 0.55;
}

.dashboard-nav__badge {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-on-ink-muted);
  border: 1px solid var(--line-on-ink);
  border-radius: 999px;
  padding: 2px 8px;
}

.dashboard-sidebar__footer {
  border-top: 1px solid var(--line-on-ink);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dashboard-sidebar__studio {
  font-size: 14px;
  color: var(--text-on-ink);
  font-weight: 500;
}

.dashboard-sidebar__logout {
  font-size: 13px;
  color: var(--text-on-ink-muted);
  text-decoration: none;
  width: fit-content;
}

.dashboard-sidebar__logout:hover {
  color: var(--brass-300);
}

.dashboard-content {
  min-width: 0;
  padding: 32px 40px;
}

@media (max-width: 900px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .dashboard-sidebar {
    flex-direction: row;
    align-items: center;
    padding: 16px 20px;
    gap: 20px;
  }

  .dashboard-nav {
    flex-direction: row;
    flex: none;
  }

  .dashboard-sidebar__footer {
    display: none;
  }

  .dashboard-content {
    padding: 24px;
  }
}
</style>

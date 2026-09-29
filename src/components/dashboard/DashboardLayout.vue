<script setup lang="ts">
import { useRouter } from 'vue-router'
import LogoMark from '../landing/LogoMark.vue'
import { useAuth } from '../../composables/useAuth'
import { onMounted, ref } from 'vue'
import { apiClient } from '@/api/client.ts'
import { jwtDecode } from 'jwt-decode'
import { useSchedule } from '@/composables/useSchedule.ts'
import type { StudioDto } from '@/types/studio'

const router = useRouter()
const auth = useAuth()
// Placeholder até a sessão trazer dados do estúdio (a API ainda não devolve isso).
const currentStudioName = ref<string>('Estúdio Tinta & Agulha')

const navItems = [
  { label: 'Agenda', to: '/agenda', enabled: true },
  { label: 'Equipe', to: '/equipe', enabled: true },
  { label: 'Clientes', to: '/clientes', enabled: true },
  { label: 'Serviços', to: '/servicos', enabled: true },
  { label: 'Disponibilidade', to: '/disponibilidade', enabled: true },
  { label: 'Estúdio', to: '/estudio', enabled: true },
]

function handleLogout(): void {
  auth.logout()
  router.push('/')
}

onMounted(async () => {

  const studioName = sessionStorage.getItem('studioName');
  if (studioName) {
    currentStudioName.value = studioName;
  }
  else {
    const studio = await apiClient.get<StudioDto>('/me/getStudio');
    currentStudioName.value = studio.name
    sessionStorage.setItem('studioName', studio.name);
  }


})

</script>

<template>
  <div class="dashboard">
    <aside class="dashboard-sidebar">
      <router-link to="/" class="dashboard-sidebar__brand">
        <LogoMark :size="26" />
        <span>Flashbook</span>
      </router-link>

      <nav class="dashboard-nav" aria-label="Navegação do painel">
        <router-link v-for="item in navItems" :key="item.label" :to="item.to" class="dashboard-nav__item"
          :class="{ 'dashboard-nav__item--disabled': !item.enabled }" :aria-disabled="!item.enabled">
          {{ item.label }}
          <span v-if="!item.enabled" class="dashboard-nav__badge">em breve</span>
        </router-link>
      </nav>

      <div class="dashboard-sidebar__footer">
        <p class="dashboard-sidebar__studio">{{ currentStudioName }}</p>
        <button type="button" class="dashboard-sidebar__logout" @click="handleLogout">Sair</button>
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
  border: none;
  background: transparent;
  padding: 0;
  font-family: inherit;
  font-size: 13px;
  color: var(--text-on-ink-muted);
  text-decoration: none;
  text-align: left;
  width: fit-content;
  cursor: pointer;
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

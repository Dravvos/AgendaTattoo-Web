import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import LandingPage from '@/views/LandingPage.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import ServiceSettingsView from '@/views/ServiceSettingsView.vue'
import AvailabilitySettingsView from '@/views/AvailabilitySettingsView.vue'
import ArtistsSettingsView from '@/views/ArtistsSettingsView.vue'
import ClientsView from '@/views/ClientsView.vue'
import StudioSettingsView from '@/views/StudioSettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: RegisterView,
    },
    {
      path: '/agenda',
      name: 'agenda',
      // TODO: proteger esta rota (navigation guard) quando a sessão/login existir.
      component: ScheduleView,
      meta: { requiresAuth: true }
    },
    {
      path: '/servicos',
      name: "servicos",
      component: ServiceSettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/disponibilidade',
      name: "disponibilidade",
      component: AvailabilitySettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/equipe',
      name: 'equipe',
      component: ArtistsSettingsView,
      meta: { requiresAuth: true }
    },
        {
      path: '/clientes',
      name: 'clientes',
      component: ClientsView,
      meta: { requiresAuth: true }
    },
        {
      path: '/estudio',
      name: 'estudio',
      component: StudioSettingsView,
      meta: { requiresAuth: true }
    }


    // Qualquer nova rota dentro da área logada (sob o DashboardLayout) deve
    // levar `meta: { requiresAuth: true }` também.
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return typeof to.query.redirect === 'string' ? to.query.redirect : { name: 'agenda' }
  }

  return true
})

export default router

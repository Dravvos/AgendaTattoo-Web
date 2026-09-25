import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import LandingPage from '@/views/LandingPage.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

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
  if (!to.meta.requiresAuth) return true

  const { isAuthenticated } = useAuth()
  if (isAuthenticated.value) return true

  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router

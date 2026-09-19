import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'

import AgendaTattooPreset from './theme/preset'
import './assets/styles/global.css'
import './assets/styles/auth.css'

const app = createApp(App)


app.use(PrimeVue, {
  theme: {
    preset: AgendaTattooPreset,
    options: {
      // O app não segue o esquema claro/escuro do sistema operacional:
      // claro/escuro aqui são zonas de marca intencionais, não um modo alternável.
      darkModeSelector: '.app-dark-mode-not-used',
    },
  },
  license:"eyJpZCI6IjllZjA0MTVhLTY5NzktNGNhYy05ZDQzLWRjYjNhMDFlNDE2YSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODk3Nzc1MzksImV4cCI6MTgyMTMxMzUzOX0.tUp5qsao61Tw9mZPsiQZ-UHmR65uult6skq35IzSsIbQoEf4j91aspk2CGlSpweC1creHIhYB6_Gezo2Jr2eDg"
})

app.use(router)

app.mount('#app')

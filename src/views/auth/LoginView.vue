<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import AuthLayout from '../../components/auth/AuthLayout.vue'
import { authApi, ApiError, extractValidationErrors, type LoginRequest } from '../../api'
import { useAuth } from '../../composables/useAuth'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

interface LoginForm extends LoginRequest {
  remember: boolean
}

const form = reactive<LoginForm>({
  email: '',
  password: '',
  remember: false,
})

const errors = reactive({
  email: '',
  password: '',
})

const submitting = ref(false)
const generalError = ref('')

function validate(): boolean {
  errors.email = ''
  errors.password = ''

  if (!form.email.trim()) {
    errors.email = 'Informe seu e-mail.'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (!form.password) {
    errors.password = 'Informe sua senha.'
  }

  return !errors.email && !errors.password
}

async function handleSubmit(): Promise<void> {
  generalError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    const response = await authApi.login({ email: form.email, password: form.password })
    auth.login(response.accessToken)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/agenda'
    router.push(redirect)
  } catch (error) {
    const fieldErrors = extractValidationErrors(error)
    if (fieldErrors) {
      errors.email = fieldErrors.email ?? errors.email
      errors.password = fieldErrors.password ?? errors.password
      return
    }

    if (error instanceof ApiError && error.hasStatus(401)) {
      generalError.value = 'E-mail ou senha incorretos.'
    } else if (error instanceof ApiError) {
      generalError.value = error.message
    } else {
      generalError.value = 'Algo deu errado. Tente novamente.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <h1 class="auth-title">Bem-vindo de volta</h1>
    <p class="auth-subtitle">Entre para acessar a agenda do seu estúdio.</p>

    <Message v-if="generalError" severity="error" :closable="false" class="auth-message">
      {{ generalError }}
    </Message>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="field">
        <label for="email">E-mail</label>
        <InputText
          id="email"
          v-model="form.email"
          type="email"
          placeholder="voce@estudio.com"
          autocomplete="email"
          :invalid="!!errors.email"
          fluid
        />
        <small v-if="errors.email" class="field__error">{{ errors.email }}</small>
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <Password
          id="password"
          v-model="form.password"
          placeholder="Sua senha"
          autocomplete="current-password"
          :invalid="!!errors.password"
          :feedback="false"
          toggleMask
          fluid
        />
        <small v-if="errors.password" class="field__error">{{ errors.password }}</small>
      </div>

      <div class="field field--row">
        <label class="checkbox-label">
          <Checkbox v-model="form.remember" binary />
          <span>Lembrar de mim</span>
        </label>
        <a href="#" class="auth-link" @click.prevent>Esqueci minha senha</a>
      </div>

      <Button type="submit" label="Entrar" :loading="submitting" fluid />
    </form>

    <p class="auth-switch">
      Não tem conta?
      <router-link to="/cadastro">Criar conta</router-link>
    </p>
  </AuthLayout>
</template>

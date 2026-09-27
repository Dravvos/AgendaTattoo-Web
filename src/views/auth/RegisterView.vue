<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { InputText, InputPassword, Checkbox, Button, Message } from 'primevue'
import AuthLayout from '../../components/auth/AuthLayout.vue'
import { authApi, ApiError, extractValidationErrors, type RegisterRequest } from '../../api'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const auth = useAuth()

interface RegisterForm extends RegisterRequest {
  confirmPassword: string
  acceptedTerms: boolean
}

const form = reactive<RegisterForm>({
  studioName: '',
  ownerFullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
  studioSlug: ''
})

const errors = reactive({
  studioName: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: '',
})

const submitting = ref(false)
const generalError = ref('')

function validate(): boolean {
  errors.studioName = form.studioName.trim() ? '' : 'Informe o nome do estúdio.'
  errors.fullName = form.ownerFullName.trim() ? '' : 'Informe seu nome completo.'

  if (!form.email.trim()) {
    errors.email = 'Informe seu e-mail.'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Informe um e-mail válido.'
  } else {
    errors.email = ''
  }

  errors.password =
    form.password.length >= 8 ? '' : 'A senha precisa ter pelo menos 8 caracteres.'

  errors.confirmPassword =
    form.confirmPassword === form.password && form.confirmPassword
      ? ''
      : 'As senhas não coincidem.'

  errors.acceptedTerms = form.acceptedTerms
    ? ''
    : 'É preciso aceitar os termos para continuar.'

  return !Object.values(errors).some(Boolean)
}

async function handleSubmit(): Promise<void> {
  generalError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    const response = await authApi.register({
      studioName: form.studioName,
      ownerFullName: form.ownerFullName,
      email: form.email,
      password: form.password,
      studioSlug: form.studioName.toLowerCase().replaceAll(' ', '-')
    })
    auth.login(response.accessToken)
    router.push('/agenda')
  } catch (error) {
    const fieldErrors = extractValidationErrors(error)
    if (fieldErrors) {
      errors.studioName = fieldErrors.studioname ?? errors.studioName
      errors.fullName = fieldErrors.fullname ?? errors.fullName
      errors.email = fieldErrors.email ?? errors.email
      errors.password = fieldErrors.password ?? errors.password
      return
    }

    if (error instanceof ApiError && error.hasStatus(409)) {
      generalError.value = 'Já existe uma conta com esse e-mail.'
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
    <h1 class="auth-title">Crie a conta do seu estúdio</h1>
    <p class="auth-subtitle">Leva menos de dois minutos para começar.</p>

    <Message v-if="generalError" severity="error" :closable="false" class="auth-message">
      {{ generalError }}
    </Message>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="field">
        <label for="studio-name">Nome do estúdio</label>
        <InputText id="studio-name" v-model="form.studioName" placeholder="Ex: Estúdio Tinta & Agulha"
          :invalid="!!errors.studioName" fluid />
        <small v-if="errors.studioName" class="field__error">{{ errors.studioName }}</small>
      </div>

      <div class="field">
        <label for="full-name">Seu nome completo</label>
        <InputText id="full-name" v-model="form.ownerFullName" placeholder="Seu nome" autocomplete="name"
          :invalid="!!errors.fullName" fluid />
        <small v-if="errors.fullName" class="field__error">{{ errors.fullName }}</small>
      </div>

      <div class="field">
        <label for="email">E-mail</label>
        <InputText id="email" v-model="form.email" type="email" placeholder="voce@estudio.com" autocomplete="email"
          :invalid="!!errors.email" fluid />
        <small v-if="errors.email" class="field__error">{{ errors.email }}</small>
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <InputPassword id="password" v-model="form.password" placeholder="Mínimo de 8 caracteres"
          autocomplete="new-password" :invalid="!!errors.password" toggleMask fluid />
        <small v-if="errors.password" class="field__error">{{ errors.password }}</small>
      </div>

      <div class="field">
        <label for="confirm-password">Confirmar senha</label>
        <InputPassword id="confirm-password" v-model="form.confirmPassword" placeholder="Repita a senha"
          autocomplete="new-password" :invalid="!!errors.confirmPassword" :feedback="false" toggleMask fluid />
        <small v-if="errors.confirmPassword" class="field__error">{{
          errors.confirmPassword
          }}</small>
      </div>

      <div class="field">
        <label class="checkbox-label">
          <Checkbox v-model="form.acceptedTerms" binary :invalid="!!errors.acceptedTerms" />
          <span>Li e aceito os termos de uso e a política de privacidade.</span>
        </label>
        <small v-if="errors.acceptedTerms" class="field__error">{{
          errors.acceptedTerms
          }}</small>
      </div>

      <Button type="submit" label="Criar conta" :loading="submitting" fluid />
    </form>

    <p class="auth-switch">
      Já tem conta?
      <router-link to="/login">Entrar</router-link>
    </p>
  </AuthLayout>
</template>

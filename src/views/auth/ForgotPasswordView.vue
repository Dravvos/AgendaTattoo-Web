<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import AuthLayout from '../../components/auth/AuthLayout.vue'
import { authApi, ApiError } from '../../api'

const email = ref('')
const emailError = ref('')
const submitting = ref(false)
const submitted = ref(false)
const generalError = ref('')

function validate(): boolean {
  emailError.value = ''
  if (!email.value.trim()) {
    emailError.value = 'Informe seu e-mail.'
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    emailError.value = 'Informe um e-mail válido.'
  }
  return !emailError.value
}

async function handleSubmit(): Promise<void> {
  generalError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    await authApi.forgotPassword({ email: email.value.trim() })
    // O backend sempre devolve 204 aqui, exista ou não o e-mail — a mensagem abaixo
    // é a mesma nos dois casos de propósito, pra não revelar quais e-mails têm conta.
    submitted.value = true
  } catch (error) {
    generalError.value = error instanceof ApiError ? error.message : 'Algo deu errado. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <template v-if="!submitted">
      <h1 class="auth-title">Esqueceu sua senha?</h1>
      <p class="auth-subtitle">Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.</p>

      <Message v-if="generalError" severity="error" :closable="false" class="auth-message">
        {{ generalError }}
      </Message>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">E-mail</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="voce@estudio.com"
            autocomplete="email"
            :invalid="!!emailError"
            fluid
          />
          <small v-if="emailError" class="field__error">{{ emailError }}</small>
        </div>

        <Button type="submit" label="Enviar link de redefinição" :loading="submitting" fluid />
      </form>
    </template>

    <template v-else>
      <h1 class="auth-title">Verifique seu e-mail</h1>
      <p class="auth-subtitle">
        Se existir uma conta com esse e-mail, você vai receber um link para redefinir a senha em instantes.
      </p>
    </template>

    <p class="auth-switch">
      Lembrou a senha?
      <router-link to="/login">Entrar</router-link>
    </p>
  </AuthLayout>
</template>

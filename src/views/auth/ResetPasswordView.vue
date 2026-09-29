<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputPassword  from 'primevue/inputpassword'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import AuthLayout from '../../components/auth/AuthLayout.vue'
import { authApi, ApiError } from '../../api'

const route = useRoute()
const router = useRouter()

const email = typeof route.query.email === 'string' ? route.query.email : ''
const token = typeof route.query.token === 'string' ? route.query.token : ''
const missingParams = !email || !token

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  newPassword: '',
  confirmPassword: '',
})

const submitting = ref(false)
const submitted = ref(false)
const generalError = ref('')

function validate(): boolean {
  errors.newPassword = form.newPassword.length >= 8 ? '' : 'A senha precisa ter pelo menos 8 caracteres.'
  errors.confirmPassword =
    form.confirmPassword === form.newPassword && form.confirmPassword ? '' : 'As senhas não coincidem.'
  return !errors.newPassword && !errors.confirmPassword
}

async function handleSubmit(): Promise<void> {
  generalError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    await authApi.resetPassword({ email, token, newPassword: form.newPassword })
    submitted.value = true
  } catch (error) {
    // Cobre tanto "link inválido/expirado" quanto senha fraca — a mensagem do backend
    // já vem pronta pra mostrar (ValidationAppException.Message via ProblemDetails).
    generalError.value =
      error instanceof ApiError ? error.message : 'Não foi possível redefinir a senha. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <template v-if="missingParams">
      <h1 class="auth-title">Link inválido</h1>
      <p class="auth-subtitle">Esse link de redefinição de senha está incompleto ou é inválido.</p>
      <p class="auth-switch">
        <router-link to="/esqueci-senha">Solicitar um novo link</router-link>
      </p>
    </template>

    <template v-else-if="!submitted">
      <h1 class="auth-title">Criar nova senha</h1>
      <p class="auth-subtitle">Escolha uma nova senha para {{ email }}.</p>

      <Message v-if="generalError" severity="error" :closable="false" class="auth-message">
        {{ generalError }}
      </Message>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="new-password">Nova senha</label>
          <InputPassword
            id="new-password"
            v-model="form.newPassword"
            placeholder="Mínimo de 8 caracteres"
            autocomplete="new-password"
            :invalid="!!errors.newPassword"
            toggleMask
            fluid
          />
          <small v-if="errors.newPassword" class="field__error">{{ errors.newPassword }}</small>
        </div>

        <div class="field">
          <label for="confirm-password">Confirmar nova senha</label>
          <InputPassword
            id="confirm-password"
            v-model="form.confirmPassword"
            placeholder="Repita a senha"
            autocomplete="new-password"
            :invalid="!!errors.confirmPassword"
            :feedback="false"
            toggleMask
            fluid
          />
          <small v-if="errors.confirmPassword" class="field__error">{{ errors.confirmPassword }}</small>
        </div>

        <Button type="submit" label="Redefinir senha" :loading="submitting" fluid />
      </form>
    </template>

    <template v-else>
      <h1 class="auth-title">Senha redefinida</h1>
      <p class="auth-subtitle">Sua senha foi alterada. Você já pode entrar com a nova senha.</p>
      <Button label="Ir para o login" fluid @click="router.push('/login')" />
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InputPassword, Checkbox, Button, Message, InputText } from 'primevue'

import AuthLayout from '../../components/auth/AuthLayout.vue'

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const errors = reactive({
  email: '',
  password: '',
})

const submitted = ref<boolean>(false)
const submitting = ref<boolean>(false)

function validate() {
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

function handleSubmit() {
  submitted.value = false
  if (!validate()) return

  // TODO: integrar com o endpoint de autenticação da API quando estiver pronto.
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    submitted.value = true
  }, 600)
}
</script>

<template>
  <AuthLayout>
    <h1 class="auth-title">Bem-vindo de volta</h1>
    <p class="auth-subtitle">Entre para acessar a agenda do seu estúdio.</p>

    <Message v-if="submitted" severity="success" :closable="false" class="auth-message">
      Formulário validado. A integração com a API de login ainda será conectada aqui.
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
        <InputPassword
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

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InputPassword, InputText, Checkbox, Button, Message } from 'primevue'
import AuthLayout from '../../components/auth/AuthLayout.vue'

const form = reactive({
  studioName: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
})

const errors = reactive({
  studioName: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: '',
})

const submitted = ref(false)
const submitting = ref(false)

function validate() {
  errors.studioName = form.studioName.trim() ? '' : 'Informe o nome do estúdio.'
  errors.fullName = form.fullName.trim() ? '' : 'Informe seu nome completo.'

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

function handleSubmit() {
  submitted.value = false
  if (!validate()) return

  // TODO: integrar com o endpoint de cadastro (estúdio + usuário dono) quando estiver pronto.
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    submitted.value = true
  }, 600)
}
</script>

<template>
  <AuthLayout>
    <h1 class="auth-title">Crie a conta do seu estúdio</h1>
    <p class="auth-subtitle">Leva menos de dois minutos para começar.</p>

    <Message v-if="submitted" severity="success" :closable="false" class="auth-message">
      Formulário validado. A integração com a API de cadastro ainda será conectada aqui.
    </Message>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="field">
        <label for="studio-name">Nome do estúdio</label>
        <InputText
          id="studio-name"
          v-model="form.studioName"
          placeholder="Ex: Estúdio Tinta & Agulha"
          :invalid="!!errors.studioName"
          fluid
        />
        <small v-if="errors.studioName" class="field__error">{{ errors.studioName }}</small>
      </div>

      <div class="field">
        <label for="full-name">Seu nome completo</label>
        <InputText
          id="full-name"
          v-model="form.fullName"
          placeholder="Seu nome"
          autocomplete="name"
          :invalid="!!errors.fullName"
          fluid
        />
        <small v-if="errors.fullName" class="field__error">{{ errors.fullName }}</small>
      </div>

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
          placeholder="Mínimo de 8 caracteres"
          autocomplete="new-password"
          :invalid="!!errors.password"
          toggleMask
          fluid
        />
        <small v-if="errors.password" class="field__error">{{ errors.password }}</small>
      </div>

      <div class="field">
        <label for="confirm-password">Confirmar senha</label>
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

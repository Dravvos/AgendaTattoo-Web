<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Mask from 'primevue/mask'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { jwtDecode } from 'jwt-decode'
import { studioApi } from '@/api/studioApi'
import type { StudioDto } from '@/types/studio'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import { useAuth } from '@/composables/useAuth'
import router from '@/router'

const toast = useToast()
const confirm = useConfirm()
const auth = useAuth()

const isOwner = computed(() => {
  const decoded: any = jwtDecode(auth.token.value)
  return decoded.role?.includes('Owner') ?? false
})

// Fusos horários comuns no Brasil (pós-2019, sem horário de verão). Se o estúdio precisar
// de outro, dá pra digitar direto no campo de fuso — o Select aceita valor livre via editable.
const TIMEZONE_OPTIONS = [
  { label: 'Brasília, São Paulo, Rio de Janeiro (America/Sao_Paulo)', value: 'America/Sao_Paulo' },
  { label: 'Manaus (America/Manaus)', value: 'America/Manaus' },
  { label: 'Cuiabá, Campo Grande (America/Cuiaba)', value: 'America/Cuiaba' },
  { label: 'Belém (America/Belem)', value: 'America/Belem' },
  { label: 'Fortaleza, Recife, Maceió (America/Fortaleza)', value: 'America/Fortaleza' },
  { label: 'Salvador (America/Bahia)', value: 'America/Bahia' },
  { label: 'Rio Branco (America/Rio_Branco)', value: 'America/Rio_Branco' },
  { label: 'Fernando de Noronha (America/Noronha)', value: 'America/Noronha' },
]

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')

const original = ref<StudioDto | null>(null)

const form = reactive({
  name: '',
  slug: '',
  description: '',
  phoneNumber: '',
  address: '',
  timeZoneId: 'America/Sao_Paulo',
})

const formErrors = reactive({
  name: '',
  slug: '',
  timeZoneId: '',
})

const publicBookingLink = computed(() => {
  if (!form.slug) return ''
  return `${window.location.origin}/agendar/${form.slug}`
})

async function copyPublicLink() {
  try {
    await navigator.clipboard.writeText(publicBookingLink.value)
    toast.add({ severity: 'success', summary: 'Link copiado', life: 2000 })
  } catch {
    toast.add({ severity: 'warn', summary: 'Não foi possível copiar automaticamente', life: 3000 })
  }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const studio = await studioApi.get()
    original.value = studio
    form.name = studio.name
    form.slug = studio.slug
    form.description = studio.description ?? ''
    form.phoneNumber = studio.phoneNumber ?? ''
    form.address = studio.address ?? ''
    form.timeZoneId = studio.timeZoneId
  } catch (error) {
    loadError.value = (error as Error).message
  } finally {
    loading.value = false
  }
}

function clearErrors() {
  formErrors.name = ''
  formErrors.slug = ''
  formErrors.timeZoneId = ''
}

function validate(): boolean {
  clearErrors()
  let valid = true

  const trimmedName = form.name.trim()
  if (trimmedName.length < 2 || trimmedName.length > 150) {
    formErrors.name = 'Informe um nome entre 2 e 150 caracteres.'
    valid = false
  }

  const trimmedSlug = form.slug.trim().toLowerCase()
  if (!/^[a-z0-9-]{2,80}$/.test(trimmedSlug)) {
    formErrors.slug = 'Use apenas letras minúsculas, números e hífen (2 a 80 caracteres).'
    valid = false
  }

  if (!form.timeZoneId) {
    formErrors.timeZoneId = 'Selecione um fuso horário.'
    valid = false
  }

  return valid
}

async function submit() {
  if (!validate()) return

  const slugChanged = original.value && form.slug.trim().toLowerCase() !== original.value.slug
  if (slugChanged) {
    confirm.require({
      header: 'Alterar o link público?',
      message:
        'Mudar o identificador do estúdio troca o link de agendamento. Qualquer link já enviado a clientes ' +
        'para de funcionar. Quer continuar mesmo assim?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Alterar mesmo assim',
      rejectLabel: 'Cancelar',
      acceptClass: 'p-button-danger',
      accept: save,
    })
    return
  }

  await save()
}

async function save() {
  saving.value = true
  try {
    const updated = await studioApi.update({
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      address: form.address.trim() || null,
      timeZoneId: form.timeZoneId,
    })
    original.value = updated
    sessionStorage.setItem('studioName', updated.name)
    toast.add({ severity: 'success', summary: 'Estúdio atualizado', life: 3000 })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível salvar',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/login')
    auth.logout()
    return
  }
  load()
})
</script>

<template>
  <DashboardLayout>
    <div class="studio-settings">
      <div class="schedule-page__heading">
        <h1>Estúdio</h1>
        <p>Dados que aparecem para o cliente na agenda pública de agendamento.</p>
      </div>

      <Message v-if="!isOwner" severity="info" :closable="false" class="studio-settings__notice">
        Só o dono do estúdio pode editar esses dados. Você pode visualizar, mas os campos abaixo ficam bloqueados.
      </Message>

      <Message v-if="loadError" severity="error" :closable="false" class="studio-settings__notice">
        {{ loadError }}
      </Message>

      <Skeleton v-if="loading" height="420px" />

      <form v-else class="studio-settings__form" novalidate @submit.prevent="submit">
        <div class="studio-settings__field">
          <label for="studio-name">Nome do estúdio</label>
          <InputText id="studio-name" v-model="form.name" :disabled="!isOwner" :invalid="!!formErrors.name" fluid />
          <small v-if="formErrors.name" class="studio-settings__error">{{ formErrors.name }}</small>
        </div>

        <div class="studio-settings__field">
          <label for="studio-slug">Identificador (link público)</label>
          <InputText id="studio-slug" v-model="form.slug" :disabled="!isOwner" :invalid="!!formErrors.slug" fluid />
          <small v-if="formErrors.slug" class="studio-settings__error">{{ formErrors.slug }}</small>
          <small v-else class="studio-settings__hint">
            Link atual:
            <a :href="publicBookingLink" target="_blank" rel="noopener">{{ publicBookingLink }}</a>
          </small>
          <Button v-if="publicBookingLink" label="Copiar link" icon="pi pi-copy" text size="small"
            class="studio-settings__copy-btn" @click="copyPublicLink" />
        </div>

        <div class="studio-settings__field">
          <label for="studio-description">Descrição</label>
          <Textarea id="studio-description" v-model="form.description" :disabled="!isOwner" rows="3" autoResize fluid />
        </div>

        <div class="studio-settings__field-row">
          <div class="studio-settings__field">
            <label for="studio-phone">Telefone</label>
            <InputText id="studio-phone" v-mask="'(99) 9 9999-9999'" v-model="form.phoneNumber" fluid :disabled="!isOwner" />
          </div>

          <div class="studio-settings__field">
            <label for="studio-timezone">Fuso horário</label>
            <Select id="studio-timezone" v-model="form.timeZoneId" :options="TIMEZONE_OPTIONS" optionLabel="label"
              optionValue="value" :disabled="!isOwner" :invalid="!!formErrors.timeZoneId" fluid />
            <small v-if="formErrors.timeZoneId" class="studio-settings__error">{{ formErrors.timeZoneId }}</small>
          </div>
        </div>

        <div class="studio-settings__field">
          <label for="studio-address">Endereço</label>
          <InputText id="studio-address" v-model="form.address" :disabled="!isOwner" fluid />
        </div>

        <div v-if="isOwner" class="studio-settings__footer">
          <Button type="submit" label="Salvar alterações" :loading="saving" />
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.studio-settings__notice {
  margin-bottom: 1.5rem;
}

.studio-settings__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 32rem;
  color: var(--text-on-paper-muted, #6b7280);
}

.studio-settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  position: relative;
}

.studio-settings__field-row {
  display: flex;
  gap: 1rem;
}

.studio-settings__field-row .studio-settings__field {
  flex: 1;
}

.studio-settings__error {
  color: var(--p-red-500, #ef4444);
}

.studio-settings__hint {
  color: var(--p-text-muted-color, #6b7280);
  word-break: break-all;
}

.studio-settings__hint a {
  color: inherit;
}

.studio-settings__copy-btn {
  align-self: flex-start;
  padding-left: 0;
}

.studio-settings__footer {
  margin-top: 0.5rem;
}

.schedule-page__heading h1 {
  font-size: 28px;
  color: var(--text-on-paper);
}

.schedule-page__heading p {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-on-paper-muted);
  margin-bottom: 1.5rem;
}
</style>

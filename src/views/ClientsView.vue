<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import  Mask  from 'primevue/mask'
import Textarea from 'primevue/textarea'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useToast } from 'primevue/usetoast'
import { clientsApi } from '@/api/clientsApi'
import type { ClientDto } from '@/types/settings'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import router from '@/router'
import { useAuth } from '@/composables/useAuth'

const toast = useToast()
const auth = useAuth()

const clients = ref<ClientDto[]>([])
const loading = ref(false)
const searchTerm = ref('')

const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
  notes: '',
})

const formErrors = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
})

async function loadClients() {
  loading.value = true
  try {
    clients.value = await clientsApi.list(searchTerm.value.trim() || undefined)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar clientes',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Busca com debounce — evita disparar uma chamada a cada tecla digitada.
let searchTimeout: ReturnType<typeof setTimeout> | undefined
watch(searchTerm, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadClients, 300)
})

function clearErrors() {
  formErrors.fullName = ''
  formErrors.phoneNumber = ''
  formErrors.email = ''
}

function openCreateDialog() {
  editingId.value = null
  form.fullName = ''
  form.phoneNumber = ''
  form.email = ''
  form.notes = ''
  clearErrors()
  dialogVisible.value = true
}

function openEditDialog(client: ClientDto) {
  editingId.value = client.id
  form.fullName = client.fullName
  form.phoneNumber = client.phoneNumber
  form.email = client.email ?? ''
  form.notes = client.notes ?? ''
  clearErrors()
  dialogVisible.value = true
}

function validate(): boolean {
  clearErrors()
  let valid = true

  const trimmedName = form.fullName.trim()
  if (trimmedName.length < 2 || trimmedName.length > 150) {
    formErrors.fullName = 'Informe um nome entre 2 e 150 caracteres.'
    valid = false
  }

  const trimmedPhone = form.phoneNumber.trim()
  if (trimmedPhone.length < 8 || trimmedPhone.length > 30) {
    formErrors.phoneNumber = 'Informe um telefone válido.'
    valid = false
  }

  const trimmedEmail = form.email.trim()
  if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
    formErrors.email = 'Informe um e-mail válido.'
    valid = false
  }

  return valid
}

async function save() {
  if (!validate()) return

  saving.value = true
  try {
    const payload = {
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (editingId.value) {
      await clientsApi.update(editingId.value, payload)
      toast.add({ severity: 'success', summary: 'Cliente atualizado', life: 3000 })
    } else {
      await clientsApi.create(payload)
      toast.add({ severity: 'success', summary: 'Cliente cadastrado', life: 3000 })
    }
    dialogVisible.value = false
    await loadClients()
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
  loadClients()
})
</script>

<template>
  <DashboardLayout>
    <div class="clients-view">
      <div class="clients-view__header">
        <div class="schedule-page__heading">
          <h1>Clientes</h1>
          <p>Cadastro dos clientes do estúdio — usado para localizar rapidamente ao criar um agendamento.</p>
        </div>
        <Button label="Novo cliente" icon="pi pi-plus" @click="openCreateDialog" />
      </div>

      <IconField class="clients-view__search">
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchTerm" placeholder="Buscar por nome ou telefone" fluid />
      </IconField>

      <DataTable :value="clients" :loading="loading" dataKey="id" responsiveLayout="scroll">
        <Column field="fullName" header="Nome" />
        <Column field="phoneNumber" header="Telefone" />
        <Column field="email" header="E-mail">
          <template #body="{ data }">
            <span class="clients-view__muted">{{ data.email || '—' }}</span>
          </template>
        </Column>
        <Column field="notes" header="Observações">
          <template #body="{ data }">
            <span class="clients-view__muted clients-view__notes">{{ data.notes || '—' }}</span>
          </template>
        </Column>
        <Column header="" :style="{ width: '4rem' }">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" text rounded aria-label="Editar" @click="openEditDialog(data)" />
          </template>
        </Column>
        <template #empty>
          {{ searchTerm ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.' }}
        </template>
      </DataTable>

      <Dialog
        v-model:visible="dialogVisible"
        modal
        :header="editingId ? 'Editar cliente' : 'Novo cliente'"
        :style="{ width: '28rem' }"
      >
        <div class="clients-view__field">
          <label for="client-name">Nome completo</label>
          <InputText id="client-name" v-model="form.fullName" :invalid="!!formErrors.fullName" fluid :loading="loading" required />
          <small v-if="formErrors.fullName" class="clients-view__error">{{ formErrors.fullName }}</small>
        </div>

        <div class="clients-view__field">
          <label for="client-phone">Telefone</label>
          <Mask id="client-phone" mask="(99) 9 9999-9999" v-model="form.phoneNumber" :invalid="!!formErrors.phoneNumber" fluid :loading="loading" required />
          <small v-if="formErrors.phoneNumber" class="clients-view__error">{{ formErrors.phoneNumber }}</small>
        </div>

        <div class="clients-view__field">
          <label for="client-email">E-mail (opcional)</label>
          <InputText id="client-email" v-model="form.email" type="email" :invalid="!!formErrors.email" fluid />
          <small v-if="formErrors.email" class="clients-view__error">{{ formErrors.email }}</small>
        </div>

        <div class="clients-view__field">
          <label for="client-notes">Observações (opcional)</label>
          <Textarea id="client-notes" v-model="form.notes" rows="3" autoResize fluid />
        </div>

        <template #footer>
          <Button label="Cancelar" text @click="dialogVisible = false" />
          <Button label="Salvar" :loading="saving" @click="save" />
        </template>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.clients-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.clients-view__search {
  max-width: 22rem;
  margin-bottom: 1.25rem;
}

.clients-view__muted {
  color: var(--p-text-muted-color, #6b7280);
}

.clients-view__notes {
  display: inline-block;
  max-width: 22rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.clients-view__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.clients-view__error {
  color: var(--p-red-500, #ef4444);
}

.schedule-page__heading h1 {
  font-size: 28px;
  color: var(--text-on-paper);
}

.schedule-page__heading p {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-on-paper-muted);
}
</style>

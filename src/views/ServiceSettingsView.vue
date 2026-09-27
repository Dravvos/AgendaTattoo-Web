<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { servicesApi } from '@/api/servicesapi'
import { type ServiceDto } from '@/types/settings'
import { useAuth } from '@/composables/useAuth'
import { jwtDecode } from 'jwt-decode'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import router from '@/router'

const toast = useToast()
const confirm = useConfirm()
const auth = useAuth()

// Só o Owner pode criar/editar/desativar (regra espelhada do backend: [Authorize(Policy = "OwnerOnly")]).
const isOwner = computed(() => {
  const token = auth.token;
  const decodedToken: any = jwtDecode(token.value);

  return decodedToken.role.includes('Owner');
})

const services = ref<ServiceDto[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  durationMinutes: 60,
  price: 0,
  isActive: true,
})

const formErrors = reactive({
  name: '',
  durationMinutes: '',
  price: '',
})

async function loadServices() {
  loading.value = true
  try {
    services.value = await servicesApi.list()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar serviços',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

function clearErrors() {
  formErrors.name = ''
  formErrors.durationMinutes = ''
  formErrors.price = ''
}

function openCreateDialog() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.durationMinutes = 60
  form.price = 0
  form.isActive = true
  clearErrors()
  dialogVisible.value = true
}

function openEditDialog(service: ServiceDto) {
  editingId.value = service.id
  form.name = service.name
  form.description = service.description ?? ''
  form.durationMinutes = service.durationMinutes
  form.price = service.price
  form.isActive = service.isActive
  clearErrors()
  dialogVisible.value = true
}

function validate(): boolean {
  clearErrors()
  let valid = true

  const trimmedName = form.name.trim()
  if (trimmedName.length < 2 || trimmedName.length > 150) {
    formErrors.name = 'Informe um nome entre 2 e 150 caracteres.'
    valid = false
  }
  if (form.durationMinutes < 5 || form.durationMinutes > 1440) {
    formErrors.durationMinutes = 'A duração deve ser entre 5 e 1440 minutos.'
    valid = false
  }
  if (form.price < 0) {
    formErrors.price = 'O preço não pode ser negativo.'
    valid = false
  }

  return valid
}

async function save() {
  if (!validate()) return

  saving.value = true
  try {
    if (editingId.value) {
      await servicesApi.update(editingId.value, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        durationMinutes: form.durationMinutes,
        price: form.price,
        isActive: form.isActive,
      })
      toast.add({ severity: 'success', summary: 'Serviço atualizado', life: 3000, closable: true })
    } else {
      await servicesApi.create({
        name: form.name.trim(),
        description: form.description.trim() || null,
        durationMinutes: form.durationMinutes,
        price: form.price,
      })
      toast.add({ severity: 'success', summary: 'Serviço criado', life: 3000, closable: true })
    }
    dialogVisible.value = false
    await loadServices()
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

function confirmDeactivate(service: ServiceDto) {
  confirm.require({
    message: `Desativar o serviço "${service.name}"? Ele deixa de aparecer na agenda pública, mas os agendamentos já feitos não são afetados.`,
    header: 'Desativar serviço',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Desativar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => deactivate(service),
  })
}

async function deactivate(service: ServiceDto) {
  try {
    await servicesApi.deactivate(service.id)
    toast.add({ severity: 'success', summary: 'Serviço desativado', life: 3000 })
    await loadServices()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível desativar',
      detail: (error as Error).message,
      life: 5000,
    })
  }
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

onMounted(() => {
  if (!auth.isAuthenticated) {
    router.push('/login');
    auth.logout();
  }

  loadServices()
})
</script>

<template>
  <DashboardLayout>
    <div class="services-settings">
      <div class="services-settings__header">
        <div class="schedule-page__heading">
          <h1>Serviços</h1>
          <p>Tipos de sessão oferecidos pelo estúdio — nome, duração e preço aparecem na agenda pública.</p>
        </div>
        <Button v-if="isOwner" label="Novo serviço" icon="pi pi-plus" @click="openCreateDialog" />
      </div>

      <DataTable :value="services" :loading="loading" dataKey="id" responsiveLayout="scroll">
        <Column field="name" header="Nome" />
        <Column field="description" header="Descrição">
          <template #body="{ data }">
            <span class="services-settings__muted">{{ data.description || '—' }}</span>
          </template>
        </Column>
        <Column field="durationMinutes" header="Duração">
          <template #body="{ data }">{{ data.durationMinutes }} min</template>
        </Column>
        <Column field="price" header="Preço">
          <template #body="{ data }">{{ formatPrice(data.price) }}</template>
        </Column>
        <Column field="isActive" header="Status">
          <template #body="{ data }">
            <Tag :severity="data.isActive ? 'success' : 'danger'" :value="data.isActive ? 'Ativo' : 'Inativo'" />
          </template>
        </Column>
        <Column v-if="isOwner" header="" :style="{ width: '8rem' }">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" text rounded aria-label="Editar" @click="openEditDialog(data)" />
            <Button v-if="data.isActive" icon="pi pi-ban" text rounded severity="danger" aria-label="Desativar"
              @click="confirmDeactivate(data)" />
          </template>
        </Column>
        <template #empty>Nenhum serviço cadastrado ainda.</template>
      </DataTable>

      <Dialog v-model:visible="dialogVisible" modal :header="editingId ? 'Editar serviço' : 'Novo serviço'"
        :style="{ width: '28rem' }">
        <div class="services-settings__field">
          <label for="service-name">Nome</label>
          <InputText id="service-name" v-model="form.name" :invalid="!!formErrors.name" />
          <small v-if="formErrors.name" class="services-settings__error">{{ formErrors.name }}</small>
        </div>

        <div class="services-settings__field">
          <label for="service-description">Descrição</label>
          <Textarea id="service-description" v-model="form.description" rows="3" autoResize />
        </div>

        <div class="services-settings__field-row">
          <div class="services-settings__field">
            <label for="service-duration">Duração (minutos)</label>
            <InputNumber id="service-duration" v-model="form.durationMinutes" :min="5" :max="1440"
              :invalid="!!formErrors.durationMinutes" />
            <small v-if="formErrors.durationMinutes" class="services-settings__error">
              {{ formErrors.durationMinutes }}
            </small>
          </div>

          <div class="services-settings__field">
            <label for="service-price">Preço</label>
            <InputNumber id="service-price" v-model="form.price" mode="currency" currency="BRL" locale="pt-BR" :min="0"
              :invalid="!!formErrors.price" />
            <small v-if="formErrors.price" class="services-settings__error">{{ formErrors.price }}</small>
          </div>
        </div>

        <div v-if="editingId" class="services-settings__field-row services-settings__field-row--align">
          <ToggleSwitch v-model="form.isActive" inputId="service-active" />
          <label for="service-active">Serviço ativo</label>
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
.services-settings__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.services-settings__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.services-settings__header p {
  margin: 0;
  color: var(--p-text-muted-color, #6b7280);
}

.services-settings__muted {
  color: var(--p-text-muted-color, #6b7280);
}

.services-settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.services-settings__field-row {
  display: flex;
  gap: 1rem;
}

.services-settings__field-row .services-settings__field {
  flex: 1;
}

.services-settings__field-row--align {
  align-items: center;
}

.services-settings__error {
  color: var(--p-red-500, #ef4444);
}

.schedule-page__heading {
  margin-bottom: 24px;
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

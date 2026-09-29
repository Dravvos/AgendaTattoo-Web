<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputPassword from 'primevue/inputpassword'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { jwtDecode } from 'jwt-decode'
import { staffApi } from '@/api/staffApi'
import type { StaffMemberDto } from '@/types/settings'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import { useAuth } from '@/composables/useAuth'
import router from '@/router'

const toast = useToast()
const confirm = useConfirm()
const auth = useAuth()

const decodedToken = computed<any>(() => jwtDecode(auth.token.value))
const isOwner = computed(() => decodedToken.value.role?.includes('Owner') ?? false)
const currentUserId = computed<string>(() => decodedToken.value.sub)

const members = ref<StaffMemberDto[]>([])
const loading = ref(false)

// Diálogo de convite (novo artista)
const inviteDialogVisible = ref(false)
const inviting = ref(false)

const inviteForm = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const inviteErrors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// Diálogo de edição (só o nome — role e e-mail não são editáveis pelo MVP)
const editDialogVisible = ref(false)
const saving = ref(false)
const editingMember = ref<StaffMemberDto | null>(null)
const editForm = reactive({ fullName: '' })
const editError = ref('')

async function loadMembers() {
  loading.value = true
  try {
    members.value = await staffApi.list()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar a equipe',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

function clearInviteErrors() {
  inviteErrors.fullName = ''
  inviteErrors.email = ''
  inviteErrors.password = ''
  inviteErrors.confirmPassword = ''
}

function openInviteDialog() {
  inviteForm.fullName = ''
  inviteForm.email = ''
  inviteForm.password = ''
  inviteForm.confirmPassword = ''
  clearInviteErrors()
  inviteDialogVisible.value = true
}

function validateInvite(): boolean {
  clearInviteErrors()
  let valid = true

  if (inviteForm.fullName.trim().length < 2) {
    inviteErrors.fullName = 'Informe o nome completo.'
    valid = false
  }
  if (!/^\S+@\S+\.\S+$/.test(inviteForm.email)) {
    inviteErrors.email = 'Informe um e-mail válido.'
    valid = false
  }
  if (inviteForm.password.length < 8) {
    inviteErrors.password = 'A senha precisa ter pelo menos 8 caracteres.'
    valid = false
  }
  if (inviteForm.confirmPassword !== inviteForm.password) {
    inviteErrors.confirmPassword = 'As senhas não coincidem.'
    valid = false
  }

  return valid
}

async function submitInvite() {
  if (!validateInvite()) return

  inviting.value = true
  try {
    await staffApi.invite({
      fullName: inviteForm.fullName.trim(),
      email: inviteForm.email.trim(),
      password: inviteForm.password,
    })
    toast.add({ severity: 'success', summary: 'Artista adicionado', life: 3000 })
    inviteDialogVisible.value = false
    await loadMembers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível adicionar o artista',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    inviting.value = false
  }
}

function openEditDialog(member: StaffMemberDto) {
  editingMember.value = member
  editForm.fullName = member.fullName
  editError.value = ''
  editDialogVisible.value = true
}

async function submitEdit() {
  if (!editingMember.value) return
  if (editForm.fullName.trim().length < 2) {
    editError.value = 'Informe um nome válido.'
    return
  }

  saving.value = true
  try {
    await staffApi.update(editingMember.value.id, { fullName: editForm.fullName.trim() })
    toast.add({ severity: 'success', summary: 'Nome atualizado', life: 3000 })
    editDialogVisible.value = false
    await loadMembers()
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

function confirmDeactivate(member: StaffMemberDto) {
  confirm.require({
    message: `Desativar "${member.fullName}"? A pessoa deixa de conseguir entrar no sistema e de receber novos agendamentos, mas o histórico é mantido.`,
    header: 'Desativar membro',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Desativar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => deactivate(member),
  })
}

async function deactivate(member: StaffMemberDto) {
  try {
    await staffApi.deactivate(member.id)
    toast.add({ severity: 'success', summary: 'Membro desativado', life: 3000 })
    await loadMembers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível desativar',
      detail: (error as Error).message,
      life: 5000,
    })
  }
}

async function reactivate(member: StaffMemberDto) {
  try {
    await staffApi.reactivate(member.id)
    toast.add({ severity: 'success', summary: 'Membro reativado', life: 3000 })
    await loadMembers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível reativar',
      detail: (error as Error).message,
      life: 5000,
    })
  }
}

function isSelf(member: StaffMemberDto): boolean {
  return member.id === currentUserId.value
}

function roleLabel(role: StaffMemberDto['role']): string {
  return role === 'Owner' ? 'Dono' : 'Tatuador'
}

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/login')
    auth.logout()
    return
  }
  loadMembers()
})
</script>

<template>
  <DashboardLayout>
    <div class="staff-settings">
      <div class="staff-settings__header">
        <div>
          <h1>Equipe</h1>
          <p>
            Quem tem acesso à agenda do estúdio. Funciona tanto para um estúdio com vários
            tatuadores quanto para quem trabalha sozinho.
          </p>
        </div>
        <Button v-if="isOwner" label="Novo artista" icon="pi pi-user-plus" @click="openInviteDialog" />
      </div>

      <DataTable :value="members" :loading="loading" dataKey="id" responsiveLayout="scroll">
        <Column field="fullName" header="Nome" />
        <Column field="email" header="E-mail" />
        <Column field="role" header="Função">
          <template #body="{ data }">
            <Tag :severity="data.role === 'Owner' ? 'info' : 'secondary'" :value="roleLabel(data.role)" />
          </template>
        </Column>
        <Column field="isActive" header="Status">
          <template #body="{ data }">
            <Tag :severity="data.isActive ? 'success' : 'danger'" :value="data.isActive ? 'Ativo' : 'Inativo'" />
          </template>
        </Column>
        <Column v-if="isOwner" header="" :style="{ width: '9rem' }">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" text rounded aria-label="Editar nome" @click="openEditDialog(data)" />
            <Button
              v-if="data.isActive"
              icon="pi pi-user-minus"
              text
              rounded
              severity="danger"
              :disabled="data.role === 'Owner' || isSelf(data)"
              :aria-label="data.role === 'Owner' ? 'O dono não pode ser desativado' : 'Desativar'"
              @click="confirmDeactivate(data)"
            />
            <Button
              v-else
              icon="pi pi-user-plus"
              text
              rounded
              severity="success"
              aria-label="Reativar"
              @click="reactivate(data)"
            />
          </template>
        </Column>
        <template #empty>Nenhum membro cadastrado ainda.</template>
      </DataTable>

      <!-- Convidar novo artista -->
      <Dialog v-model:visible="inviteDialogVisible" modal header="Novo artista" :style="{ width: '26rem' }">
        <p class="staff-settings__hint">
          Sem convite por e-mail ainda — defina o e-mail e uma senha inicial; a pessoa pode
          trocá-la depois de entrar.
        </p>

        <div class="staff-settings__field">
          <label for="invite-name">Nome completo</label>
          <InputText id="invite-name" v-model="inviteForm.fullName" :invalid="!!inviteErrors.fullName" fluid />
          <small v-if="inviteErrors.fullName" class="staff-settings__error">{{ inviteErrors.fullName }}</small>
        </div>

        <div class="staff-settings__field">
          <label for="invite-email">E-mail</label>
          <InputText
            id="invite-email"
            v-model="inviteForm.email"
            type="email"
            :invalid="!!inviteErrors.email"
            fluid
          />
          <small v-if="inviteErrors.email" class="staff-settings__error">{{ inviteErrors.email }}</small>
        </div>

        <div class="staff-settings__field">
          <label for="invite-password">Senha inicial</label>
          <InputPassword
            id="invite-password"
            v-model="inviteForm.password"
            :invalid="!!inviteErrors.password"
            toggleMask
            fluid
          />
          <small v-if="inviteErrors.password" class="staff-settings__error">{{ inviteErrors.password }}</small>
        </div>

        <div class="staff-settings__field">
          <label for="invite-confirm-password">Confirmar senha</label>
          <InputPassword
            id="invite-confirm-password"
            v-model="inviteForm.confirmPassword"
            :invalid="!!inviteErrors.confirmPassword"
            :feedback="false"
            toggleMask
            fluid
          />
          <small v-if="inviteErrors.confirmPassword" class="staff-settings__error">
            {{ inviteErrors.confirmPassword }}
          </small>
        </div>

        <template #footer>
          <Button label="Cancelar" text @click="inviteDialogVisible = false" />
          <Button label="Adicionar" :loading="inviting" @click="submitInvite" />
        </template>
      </Dialog>

      <!-- Editar nome -->
      <Dialog v-model:visible="editDialogVisible" modal header="Editar membro" :style="{ width: '22rem' }">
        <div class="staff-settings__field">
          <label for="edit-name">Nome completo</label>
          <InputText id="edit-name" v-model="editForm.fullName" :invalid="!!editError" fluid />
          <small v-if="editError" class="staff-settings__error">{{ editError }}</small>
        </div>

        <template #footer>
          <Button label="Cancelar" text @click="editDialogVisible = false" />
          <Button label="Salvar" :loading="saving" @click="submitEdit" />
        </template>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.staff-settings__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.staff-settings__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: var(--text-on-paper, #6b7280);
}

.staff-settings__header p {
  margin: 0;
  max-width: 46ch;
  color: var(--p-text-muted-color, #6b7280);
}

.staff-settings__hint {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color, #6b7280);
}

.staff-settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.staff-settings__error {
  color: var(--p-red-500, #ef4444);
}
</style>

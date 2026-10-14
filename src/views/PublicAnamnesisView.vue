<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import LogoMark from '@/components/landing/LogoMark.vue'
import { anamnesisApi } from '@/api/anamnesisApi'
import { ApiError } from '@/api'
import type { CreateAnamnesisFormRequest } from '@/types/anamnesis'
import { formatDayOptionLabel } from '@/utils/date'

const route = useRoute()
const slug = String(route.params.slug ?? '')
const appointmentId = String(route.params.appointmentId ?? '')

const pageLoading = ref(true)
const notFound = ref(false)
const loadError = ref('')

const serviceName = ref('')
const clientFirstName = ref('')
const appointmentDate = ref<Date | null>(null)
const consentText = ref('')

const alreadySubmitted = ref(false)
const submittedAt = ref<string | null>(null)
const editing = ref(false)
const submitSuccess = ref(false)

function emptyForm(): CreateAnamnesisFormRequest {
  return {
    hasAllergies: false,
    allergiesDescription: '',
    hasSkinConditions: false,
    skinConditionsDescription: '',
    hasDiabetes: false,
    hasBloodClottingDisorder: false,
    hasHeartCondition: false,
    hasEpilepsy: false,
    isPregnantOrBreastfeeding: false,
    usesBloodThinners: false,
    usesIsotretinoin: false,
    hasKeloidHistory: false,
    consumedAlcoholOrDrugsLast24h: false,
    hadPreviousTattooReaction: false,
    previousTattooReactionDescription: '',
    currentMedications: '',
    additionalNotes: '',
    consentAccepted: false,
    signatureFullName: '',
  }
}

const form = reactive<CreateAnamnesisFormRequest>(emptyForm())

const consentError = ref('')
const signatureError = ref('')
const submitting = ref(false)
const submitError = ref('')

async function load() {
  pageLoading.value = true
  notFound.value = false
  loadError.value = ''
  try {
    const status = await anamnesisApi.getPublicStatus(slug, appointmentId)
    serviceName.value = status.serviceName ?? ''
    clientFirstName.value = status.clientFirstName ?? ''
    appointmentDate.value = status.appointmentStartsAt ? new Date(status.appointmentStartsAt) : null
    consentText.value = status.consentText
    alreadySubmitted.value = status.submitted
    submittedAt.value = status.submittedAt
  } catch (error) {
    if (error instanceof ApiError && error.hasStatus(404)) {
      notFound.value = true
    } else {
      loadError.value = (error as Error).message
    }
  } finally {
    pageLoading.value = false
  }
}

function validate(): boolean {
  consentError.value = form.consentAccepted ? '' : 'É preciso confirmar o consentimento para continuar.'
  const name = form.signatureFullName.trim()
  signatureError.value = name.length >= 2 ? '' : 'Informe seu nome completo.'
  return !consentError.value && !signatureError.value
}

async function submit() {
  submitError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    const status = await anamnesisApi.submit(slug, appointmentId, form)
    submitSuccess.value = true
    alreadySubmitted.value = true
    submittedAt.value = status.submittedAt
    editing.value = false
  } catch (error) {
    submitError.value = error instanceof ApiError ? error.message : 'Não foi possível enviar a ficha. Tente novamente.'
  } finally {
    submitting.value = false
  }
}

function startEditing() {
  // Simplificação do MVP: a visão pública não devolve as respostas já enviadas, então reabrir
  // para edição começa do zero — o cliente reenvia tudo, e isso substitui a ficha anterior.
  Object.assign(form, emptyForm())
  editing.value = true
  submitSuccess.value = false
}

const showForm = computed(() => !alreadySubmitted.value || editing.value)

onMounted(load)
</script>

<template>
  <div class="anamnesis-page">
    <header class="anamnesis-page__header">
      <div class="container anamnesis-page__header-row">
        <div class="anamnesis-page__brand">
          <LogoMark :size="24" />
          <span>Flashbook</span>
        </div>
      </div>
    </header>

    <main class="container anamnesis-page__main">
      <Skeleton v-if="pageLoading" height="320px" />

      <Message v-else-if="notFound" severity="warn" :closable="false">
        Não encontramos esse agendamento. Confira se o link está correto.
      </Message>

      <Message v-else-if="loadError" severity="error" :closable="false">
        {{ loadError }}
      </Message>

      <template v-else>
        <div class="anamnesis-page__intro">
          <h1>Ficha de anamnese</h1>
          <p v-if="serviceName">
            {{ clientFirstName ? `Olá, ${clientFirstName}! ` : '' }}Preencha antes da sua sessão de
            {{ serviceName }}<span v-if="appointmentDate"> em {{ formatDayOptionLabel(appointmentDate) }}</span>.
          </p>
        </div>

        <Message v-if="alreadySubmitted && !editing" severity="success" :closable="false" class="anamnesis-page__status">
          {{ submitSuccess ? 'Obrigado! ' : '' }}Ficha enviada{{
            submittedAt ? ` em ${formatDayOptionLabel(new Date(submittedAt))}` : ''
          }}. Se algo mudar na sua saúde até a sessão, avise o estúdio diretamente.
        </Message>

        <div v-if="alreadySubmitted && !editing" class="anamnesis-page__edit-link">
          <Button label="Preencher novamente" text size="small" @click="startEditing" />
        </div>

        <form v-if="showForm" class="anamnesis-form" novalidate @submit.prevent="submit">
          <Message v-if="submitError" severity="error" :closable="false">{{ submitError }}</Message>

          <section class="anamnesis-form__section">
            <h2>Saúde</h2>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hasAllergies" binary inputId="has-allergies" />
              <label for="has-allergies">Possui alguma alergia (anestésico, látex, metais, tintas)?</label>
            </div>
            <Textarea v-if="form.hasAllergies" v-model="form.allergiesDescription" rows="2" autoResize fluid
              placeholder="Quais?" />

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hasSkinConditions" binary inputId="has-skin" />
              <label for="has-skin">Possui alguma condição de pele (psoríase, eczema, dermatite, vitiligo)?</label>
            </div>
            <Textarea v-if="form.hasSkinConditions" v-model="form.skinConditionsDescription" rows="2" autoResize fluid
              placeholder="Qual?" />

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hasDiabetes" binary inputId="has-diabetes" />
              <label for="has-diabetes">É diabético(a)?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hasBloodClottingDisorder" binary inputId="has-clotting" />
              <label for="has-clotting">Possui algum problema de coagulação sanguínea ou hemofilia?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hasHeartCondition" binary inputId="has-heart" />
              <label for="has-heart">Possui alguma doença cardíaca?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hasEpilepsy" binary inputId="has-epilepsy" />
              <label for="has-epilepsy">É epilético(a)?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.isPregnantOrBreastfeeding" binary inputId="is-pregnant" />
              <label for="is-pregnant">Está grávida ou amamentando?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.usesBloodThinners" binary inputId="uses-thinners" />
              <label for="uses-thinners">Faz uso de anticoagulantes?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.usesIsotretinoin" binary inputId="uses-isotretinoin" />
              <label for="uses-isotretinoin">Usa ou usou isotretinoína (Roacutan) nos últimos 6 meses?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hasKeloidHistory" binary inputId="has-keloid" />
              <label for="has-keloid">Tem histórico de queloide (cicatrização em relevo)?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.consumedAlcoholOrDrugsLast24h" binary inputId="consumed-alcohol" />
              <label for="consumed-alcohol">Consumiu álcool ou outras drogas nas últimas 24 horas?</label>
            </div>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.hadPreviousTattooReaction" binary inputId="had-reaction" />
              <label for="had-reaction">Já teve reação alérgica ou complicação em tatuagem anterior?</label>
            </div>
            <Textarea v-if="form.hadPreviousTattooReaction" v-model="form.previousTattooReactionDescription" rows="2"
              autoResize fluid placeholder="O que aconteceu?" />

            <div class="anamnesis-field">
              <label for="medications">Usa alguma medicação contínua? (opcional)</label>
              <InputText id="medications" v-model="form.currentMedications" fluid />
            </div>

            <div class="anamnesis-field">
              <label for="notes">Observações adicionais (opcional)</label>
              <Textarea id="notes" v-model="form.additionalNotes" rows="3" autoResize fluid />
            </div>
          </section>

          <section class="anamnesis-form__section">
            <h2>Consentimento</h2>
            <p class="anamnesis-form__consent-text">{{ consentText }}</p>

            <div class="anamnesis-field anamnesis-field--check">
              <Checkbox v-model="form.consentAccepted" binary inputId="consent" :invalid="!!consentError" />
              <label for="consent">Li e concordo com o texto acima.</label>
            </div>
            <small v-if="consentError" class="anamnesis-field__error">{{ consentError }}</small>

            <div class="anamnesis-field">
              <label for="signature">Assinatura (digite seu nome completo)</label>
              <InputText id="signature" v-model="form.signatureFullName" :invalid="!!signatureError" fluid />
              <small v-if="signatureError" class="anamnesis-field__error">{{ signatureError }}</small>
            </div>
          </section>

          <Button type="submit" label="Enviar ficha" :loading="submitting" size="large" />
        </form>
      </template>
    </main>
  </div>
</template>

<style scoped>
.anamnesis-page {
  min-height: 100vh;
  background: var(--paper-100);
  color: var(--text-on-paper);
}

.anamnesis-page__header {
  background: var(--ink-900);
  color: var(--text-on-ink);
}

.anamnesis-page__header-row {
  display: flex;
  align-items: center;
  height: 64px;
}

.anamnesis-page__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 18px;
}

.anamnesis-page__main {
  padding: 40px 0 80px;
  max-width: 640px;
}

.anamnesis-page__intro h1 {
  font-size: clamp(26px, 4vw, 34px);
}

.anamnesis-page__intro p {
  margin-top: 8px;
  color: var(--text-on-paper-muted);
}

.anamnesis-page__status {
  margin-top: 20px;
}

.anamnesis-page__edit-link {
  margin-top: 8px;
}

.anamnesis-form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.anamnesis-form__section h2 {
  font-size: 18px;
  margin-bottom: 14px;
}

.anamnesis-form__consent-text {
  font-size: 14px;
  color: var(--text-on-paper-muted);
  background: #fff;
  border: 1px solid var(--line-on-paper);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 14px;
}

.anamnesis-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.anamnesis-field--check {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.anamnesis-field--check label {
  font-size: 14px;
}

.anamnesis-field__error {
  color: var(--danger);
}
</style>
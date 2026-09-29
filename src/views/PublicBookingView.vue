<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import LogoMark from '@/components/landing/LogoMark.vue'
import { publicBookingApi } from '@/api/publicBookingApi'
import { ApiError } from '@/api'
import type { PublicStudioDto, PublicServiceDto, PublicArtistDto, AvailableSlotDto } from '@/types/public'
import { toDateKey, formatDayOptionLabel } from '@/utils/date'

const route = useRoute()
const slug = String(route.params.slug ?? '')

type Step = 'service' | 'artist' | 'datetime' | 'contact' | 'done'

// --- Carregamento inicial do estúdio ---
const pageLoading = ref(true)
const notFound = ref(false)
const loadError = ref('')

const studio = ref<PublicStudioDto | null>(null)
const services = ref<PublicServiceDto[]>([])
const artists = ref<PublicArtistDto[]>([])

async function loadStudio() {
  pageLoading.value = true
  notFound.value = false
  loadError.value = ''
  try {
    const [studioResult, servicesResult, artistsResult] = await Promise.all([
      publicBookingApi.getStudio(slug),
      publicBookingApi.listServices(slug),
      publicBookingApi.listArtists(slug),
    ])
    studio.value = studioResult
    services.value = servicesResult
    artists.value = artistsResult
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

// --- Passos do fluxo ---
const step = ref<Step>('service')
const stepHistory = ref<Step[]>([])

function goTo(next: Step) {
  stepHistory.value.push(step.value)
  step.value = next
}

function goBack() {
  const prev = stepHistory.value.pop()
  if (prev) step.value = prev
}

const stepLabels: Record<Exclude<Step, 'done'>, string> = {
  service: 'Serviço',
  artist: 'Tatuador',
  datetime: 'Data e horário',
  contact: 'Seus dados',
}
const stepOrder: Exclude<Step, 'done'>[] = ['service', 'artist', 'datetime', 'contact']
const currentStepIndex = computed(() => stepOrder.indexOf(step.value as Exclude<Step, 'done'>))

// --- Seleção de serviço / tatuador ---
const selectedService = ref<PublicServiceDto | null>(null)
const selectedArtist = ref<PublicArtistDto | null>(null)

function selectService(service: PublicServiceDto) {
  selectedService.value = service
  // Tatuador solo (ou estúdio com um único artista cadastrado): pula a etapa de escolha.
  if (artists.value.length === 1) {
    selectedArtist.value = artists.value[0] ?? null
    goTo('datetime')
  } else {
    goTo('artist')
  }
}

function selectArtist(artist: PublicArtistDto) {
  selectedArtist.value = artist
  goTo('datetime')
}

// --- Data e horário ---
const selectedDate = ref<Date>(new Date())
const slots = ref<AvailableSlotDto[]>([])
const selectedSlot = ref<AvailableSlotDto | null>(null)
const loadingSlots = ref(false)
const slotsError = ref('')

async function loadSlots() {
  if (!selectedArtist.value || !selectedService.value) return
  loadingSlots.value = true
  slotsError.value = ''
  selectedSlot.value = null
  try {
    slots.value = await publicBookingApi.getAvailability(
      slug,
      selectedArtist.value.id,
      selectedService.value.id,
      toDateKey(selectedDate.value),
    )
  } catch (error) {
    slotsError.value = (error as Error).message
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

watch(step, (s) => {
  if (s === 'datetime') loadSlots()
})
watch(selectedDate, () => {
  if (step.value === 'datetime') loadSlots()
})

function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function selectSlot(slot: AvailableSlotDto) {
  selectedSlot.value = slot
  goTo('contact')
}

// --- Dados de contato ---
const contactForm = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
  notes: '',
})

const contactErrors = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
})

const submitting = ref(false)
const submitError = ref('')

function validateContact(): boolean {
  contactErrors.fullName = ''
  contactErrors.phoneNumber = ''
  contactErrors.email = ''
  let valid = true

  const name = contactForm.fullName.trim()
  if (name.length < 2 || name.length > 150) {
    contactErrors.fullName = 'Informe seu nome completo.'
    valid = false
  }

  const phone = contactForm.phoneNumber.trim()
  if (phone.length < 8 || phone.length > 30) {
    contactErrors.phoneNumber = 'Informe um telefone válido.'
    valid = false
  }

  const email = contactForm.email.trim()
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    contactErrors.email = 'Informe um e-mail válido.'
    valid = false
  }

  return valid
}

const bookingResult = ref<{ startsAt: string; endsAt: string; status: string } | null>(null)

async function submitBooking() {
  if (!selectedArtist.value || !selectedService.value || !selectedSlot.value) return
  if (!validateContact()) return

  submitting.value = true
  submitError.value = ''
  try {
    const result = await publicBookingApi.createBooking(slug, {
      artistId: selectedArtist.value.id,
      serviceId: selectedService.value.id,
      startsAt: selectedSlot.value.startsAt,
      clientFullName: contactForm.fullName.trim(),
      clientPhoneNumber: contactForm.phoneNumber.trim(),
      clientEmail: contactForm.email.trim() || null,
      notes: contactForm.notes.trim() || null,
    })
    bookingResult.value = result
    goTo('done')
  } catch (error) {
    if (error instanceof ApiError && error.hasStatus(409)) {
      // Horário deixou de estar disponível — volta pra escolha de horário com a grade atualizada.
      submitError.value = error.message
      step.value = 'datetime'
      await loadSlots()
    } else {
      submitError.value = (error as Error).message
    }
  } finally {
    submitting.value = false
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours}h${rest}` : `${hours}h`
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function startOver() {
  selectedService.value = null
  selectedArtist.value = null
  selectedSlot.value = null
  slots.value = []
  bookingResult.value = null
  contactForm.fullName = ''
  contactForm.phoneNumber = ''
  contactForm.email = ''
  contactForm.notes = ''
  stepHistory.value = []
  step.value = 'service'
}

onMounted(loadStudio)
</script>

<template>
  <div class="public-booking">
    <header class="public-booking__header">
      <div class="container public-booking__header-row">
        <div class="public-booking__brand">
          <LogoMark :size="24" />
          <span>Flashbook</span>
        </div>
        <span v-if="studio" class="public-booking__studio-name">{{ studio.name }}</span>
      </div>
    </header>

    <main class="container public-booking__main">
      <Skeleton v-if="pageLoading" height="360px" />

      <Message v-else-if="notFound" severity="warn" :closable="false">
        Não encontramos esse estúdio. Confira se o link está correto.
      </Message>

      <Message v-else-if="loadError" severity="error" :closable="false">
        {{ loadError }}
      </Message>

      <template v-else>
        <div class="public-booking__intro">
          <h1>{{ studio?.name }}</h1>
          <p v-if="studio?.description">{{ studio.description }}</p>
          <p v-if="studio?.address || studio?.phoneNumber" class="public-booking__contact-line">
            <span v-if="studio?.address">{{ studio.address }}</span>
            <span v-if="studio?.address && studio?.phoneNumber"> · </span>
            <span v-if="studio?.phoneNumber">{{ studio.phoneNumber }}</span>
          </p>
        </div>

        <div v-if="services.length === 0" class="public-booking__empty">
          <Message severity="info" :closable="false">
            Esse estúdio ainda não cadastrou serviços disponíveis para agendamento online.
          </Message>
        </div>
        <div v-else-if="artists.length === 0" class="public-booking__empty">
          <Message severity="info" :closable="false">
            Esse estúdio ainda não tem tatuadores disponíveis para agendamento online.
          </Message>
        </div>

        <template v-else>
          <!-- Indicador de progresso -->
          <ol v-if="step !== 'done'" class="public-booking__steps">
            <li
              v-for="(s, index) in stepOrder"
              :key="s"
              :class="{
                'public-booking__step--active': s === step,
                'public-booking__step--done': index < currentStepIndex,
              }"
            >
              {{ stepLabels[s] }}
            </li>
          </ol>

          <!-- Passo 1: serviço -->
          <section v-if="step === 'service'" class="public-booking__panel">
            <h2>Escolha o serviço</h2>
            <div class="public-booking__cards">
              <button
                v-for="service in services"
                :key="service.id"
                type="button"
                class="public-booking__card"
                @click="selectService(service)"
              >
                <span class="public-booking__card-title">{{ service.name }}</span>
                <span v-if="service.description" class="public-booking__card-desc">{{ service.description }}</span>
                <span class="public-booking__card-meta">
                  {{ formatDuration(service.durationMinutes) }} · {{ formatPrice(service.price) }}
                </span>
              </button>
            </div>
          </section>

          <!-- Passo 2: tatuador -->
          <section v-else-if="step === 'artist'" class="public-booking__panel">
            <button type="button" class="public-booking__back" @click="goBack">← Voltar</button>
            <h2>Escolha o tatuador</h2>
            <div class="public-booking__cards">
              <button
                v-for="artist in artists"
                :key="artist.id"
                type="button"
                class="public-booking__card public-booking__card--compact"
                @click="selectArtist(artist)"
              >
                <span class="public-booking__card-title">{{ artist.fullName }}</span>
              </button>
            </div>
          </section>

          <!-- Passo 3: data e horário -->
          <section v-else-if="step === 'datetime'" class="public-booking__panel">
            <button type="button" class="public-booking__back" @click="goBack">← Voltar</button>
            <h2>Escolha data e horário</h2>
            <p class="public-booking__summary">
              {{ selectedService?.name }}<span v-if="selectedArtist"> com {{ selectedArtist.fullName }}</span>
            </p>

            <DatePicker v-model="selectedDate" :minDate="new Date()" dateFormat="dd/mm/yy" showIcon />

            <div class="public-booking__slots">
              <Skeleton v-if="loadingSlots" height="120px" />
              <Message v-else-if="slotsError" severity="error" :closable="false">{{ slotsError }}</Message>
              <p v-else-if="slots.length === 0" class="public-booking__empty-slots">
                Nenhum horário disponível em {{ formatDayOptionLabel(selectedDate) }}. Tente outra data.
              </p>
              <div v-else class="public-booking__slot-grid">
                <button
                  v-for="slot in slots"
                  :key="slot.startsAt"
                  type="button"
                  class="public-booking__slot"
                  @click="selectSlot(slot)"
                >
                  {{ formatTime(slot.startsAt) }}
                </button>
              </div>
            </div>
          </section>

          <!-- Passo 4: dados de contato -->
          <section v-else-if="step === 'contact'" class="public-booking__panel">
            <button type="button" class="public-booking__back" @click="goBack">← Voltar</button>
            <h2>Seus dados</h2>
            <p class="public-booking__summary">
              {{ selectedService?.name }}<span v-if="selectedArtist"> com {{ selectedArtist.fullName }}</span>
              · {{ formatDayOptionLabel(selectedDate) }}
              <span v-if="selectedSlot"> às {{ formatTime(selectedSlot.startsAt) }}</span>
            </p>

            <Message v-if="submitError" severity="error" :closable="false" class="public-booking__submit-error">
              {{ submitError }}
            </Message>

            <form class="public-booking__form" novalidate @submit.prevent="submitBooking">
              <div class="public-booking__field">
                <label for="contact-name">Nome completo</label>
                <InputText id="contact-name" v-model="contactForm.fullName" :invalid="!!contactErrors.fullName" fluid />
                <small v-if="contactErrors.fullName" class="public-booking__error">{{ contactErrors.fullName }}</small>
              </div>

              <div class="public-booking__field">
                <label for="contact-phone">Telefone (WhatsApp)</label>
                <InputText
                  id="contact-phone" v-mask="'(99) 99999-9999'"
                  v-model="contactForm.phoneNumber"
                  :invalid="!!contactErrors.phoneNumber"
                  fluid
                />
                <small v-if="contactErrors.phoneNumber" class="public-booking__error">
                  {{ contactErrors.phoneNumber }}
                </small>
              </div>

              <div class="public-booking__field">
                <label for="contact-email">E-mail (opcional)</label>
                <InputText
                  id="contact-email"
                  v-model="contactForm.email"
                  type="email"
                  :invalid="!!contactErrors.email"
                  fluid
                />
                <small v-if="contactErrors.email" class="public-booking__error">{{ contactErrors.email }}</small>
              </div>

              <div class="public-booking__field">
                <label for="contact-notes">Alguma observação? (opcional)</label>
                <Textarea id="contact-notes" v-model="contactForm.notes" rows="3" autoResize fluid />
              </div>

              <Button type="submit" label="Confirmar agendamento" :loading="submitting" size="large" />
            </form>
          </section>

          <!-- Confirmação -->
          <section v-else-if="step === 'done'" class="public-booking__panel public-booking__done">
            <h2>Agendamento enviado!</h2>
            <p v-if="bookingResult">
              {{ selectedService?.name }}<span v-if="selectedArtist"> com {{ selectedArtist.fullName }}</span>,
              {{ formatDayOptionLabel(new Date(bookingResult.startsAt)) }} às
              {{ formatTime(bookingResult.startsAt) }}.
            </p>
            <p class="public-booking__done-status">
              Status: aguardando confirmação do estúdio. Você será contatado pelo telefone informado.
            </p>
            <Button label="Fazer outro agendamento" text @click="startOver" />
          </section>
        </template>
      </template>
    </main>
  </div>
</template>

<style scoped>
.public-booking {
  min-height: 100vh;
  background: var(--paper-100);
  color: var(--text-on-paper);
}

.public-booking__header {
  background: var(--ink-900);
  color: var(--text-on-ink);
}

.public-booking__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
}

.public-booking__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 18px;
}

.public-booking__studio-name {
  font-size: 14px;
  color: var(--text-on-ink-muted);
}

.public-booking__main {
  padding: 40px 0 80px;
  max-width: 640px;
}

.public-booking__intro h1 {
  font-size: clamp(26px, 4vw, 36px);
}

.public-booking__intro p {
  margin-top: 8px;
  color: var(--text-on-paper-muted);
}

.public-booking__contact-line {
  font-size: 14px;
}

.public-booking__empty {
  margin-top: 24px;
}

.public-booking__steps {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  list-style: none;
  margin: 28px 0 24px;
  padding: 0;
  font-size: 13px;
  color: var(--text-on-paper-muted);
}

.public-booking__steps li {
  padding: 4px 10px;
  border: 1px solid var(--line-on-paper);
  border-radius: 999px;
}

.public-booking__step--active {
  border-color: var(--brass-400);
  color: var(--text-on-paper);
  font-weight: 600;
}

.public-booking__step--done {
  color: var(--brass-600);
}

.public-booking__panel h2 {
  font-size: 20px;
  margin-bottom: 16px;
}

.public-booking__back {
  border: none;
  background: none;
  color: var(--text-on-paper-muted);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
}

.public-booking__back:hover {
  color: var(--brass-600);
}

.public-booking__summary {
  color: var(--text-on-paper-muted);
  font-size: 14px;
  margin-bottom: 16px;
}

.public-booking__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.public-booking__card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  padding: 14px 16px;
  border: 1px solid var(--line-on-paper);
  border-radius: var(--radius-md);
  background: #fff;
  cursor: pointer;
  font-family: var(--font-body);
}

.public-booking__card:hover {
  border-color: var(--brass-400);
}

.public-booking__card--compact {
  flex-direction: row;
  align-items: center;
}

.public-booking__card-title {
  font-weight: 600;
}

.public-booking__card-desc {
  font-size: 13px;
  color: var(--text-on-paper-muted);
}

.public-booking__card-meta {
  font-size: 13px;
  color: var(--brass-600);
}

.public-booking__slots {
  margin-top: 20px;
}

.public-booking__empty-slots {
  color: var(--text-on-paper-muted);
  font-size: 14px;
}

.public-booking__slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 8px;
}

.public-booking__slot {
  padding: 8px 4px;
  border: 1px solid var(--line-on-paper);
  border-radius: var(--radius-sm);
  background: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
}

.public-booking__slot:hover {
  border-color: var(--brass-400);
  color: var(--brass-600);
}

.public-booking__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.public-booking__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.public-booking__error {
  color: var(--danger);
}

.public-booking__submit-error {
  margin-bottom: 16px;
}

.public-booking__done {
  text-align: center;
  padding: 32px 0;
}

.public-booking__done h2 {
  font-size: 24px;
}

.public-booking__done p {
  margin-top: 10px;
}

.public-booking__done-status {
  color: var(--text-on-paper-muted);
  font-size: 14px;
  margin-bottom: 20px;
}
</style>

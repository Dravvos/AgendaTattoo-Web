// Espelha AgendaTattoo.DTO.Public.AnamnesisFormStatusDto / CreateAnamnesisFormRequest e
// AgendaTattoo.DTO.Scheduling.AnamnesisFormDto. Mantenha em sincronia se os DTOs mudarem.

export interface AnamnesisFormStatusDto {
  submitted: boolean
  submittedAt: string | null
  clientFirstName: string | null
  serviceName: string | null
  appointmentStartsAt: string | null
  consentText: string
}

export interface CreateAnamnesisFormRequest {
  hasAllergies: boolean
  allergiesDescription?: string | null
  hasSkinConditions: boolean
  skinConditionsDescription?: string | null
  hasDiabetes: boolean
  hasBloodClottingDisorder: boolean
  hasHeartCondition: boolean
  hasEpilepsy: boolean
  isPregnantOrBreastfeeding: boolean
  usesBloodThinners: boolean
  usesIsotretinoin: boolean
  hasKeloidHistory: boolean
  consumedAlcoholOrDrugsLast24h: boolean
  hadPreviousTattooReaction: boolean
  previousTattooReactionDescription?: string | null
  currentMedications?: string | null
  additionalNotes?: string | null
  consentAccepted: boolean
  signatureFullName: string
}

// Visão interna da equipe (AnamnesisController, autenticado).
export interface AnamnesisFormDto extends CreateAnamnesisFormRequest {
  id: string
  appointmentId: string
  clientId: string
  clientName: string
  submittedAt: string
}
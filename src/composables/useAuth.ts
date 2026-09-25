import { computed, ref } from 'vue'

const TOKEN_STORAGE_KEY = 'flashbook:token'

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    // localStorage pode não estar disponível (modo privado, navegador antigo, etc.).
    return null
  }
}

// Estado no nível do módulo: todo `useAuth()` compartilha a mesma referência,
// então funciona como um mini-store sem precisar de Pinia.
const token = ref<string | null>(readStoredToken())

const isAuthenticated = computed(() => token.value !== null)

function login(newToken: string): void {
  token.value = newToken
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
  } catch {
    // Sem persistência (ex.: modo privado) a sessão ainda funciona nesta aba.
  }
}

function logout(): void {
  token.value = null
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Idem — ignora se localStorage não estiver disponível.
  }
}

/**
 * Sessão do usuário logado. Por enquanto só guarda o token (sem decodificar
 * ou validar contra a API) — o suficiente pra proteger rotas no frontend.
 * TODO: quando a API tiver um endpoint de "quem sou eu", validar o token
 * nele (e tratar expiração) em vez de só checar se existe.
 */
export function useAuth() {
  return {
    token,
    isAuthenticated,
    login,
    logout,
  }
}

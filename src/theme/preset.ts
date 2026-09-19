import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Paleta "latão" (brass) — inspirada no metal das máquinas de tatuagem,
// usada como cor primária dos componentes PrimeVue em todo o app.
const brass = {
  50: '#FBF7EE',
  100: '#F3E9D2',
  200: '#E7D3A6',
  300: '#D9BA78',
  400: '#C89F52',
  500: '#A9793C',
  600: '#8F6530',
  700: '#725029',
  800: '#584022',
  900: '#3F2F1B',
  950: '#241F17',
}

const AgendaTattooPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '3px',
      md: '4px',
      lg: '6px',
      xl: '10px',
    },
  },
  semantic: {
    primary: brass,
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.500}',
      offset: '2px',
    },
  },
})

export default AgendaTattooPreset

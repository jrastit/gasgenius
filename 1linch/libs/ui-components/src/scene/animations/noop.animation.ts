import { asyncTimeout } from '@1inch-community/core/async'
import { Animation } from './animation'

export function noopAnimation(): Animation {
  const DURATION = 0
  return {
    duration: DURATION,
    preparation: () => void 0,
    transition: async () => {
      await asyncTimeout(DURATION)
    },
    cleanup: () => void 0,
  }
}

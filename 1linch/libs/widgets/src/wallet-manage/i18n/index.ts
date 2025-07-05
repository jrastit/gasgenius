import { addTranslation } from '@1inch-community/core/lit-utils'
import { Locale } from '@1inch-community/models'

addTranslation({
  [Locale.en]: () => import('./en').then((m) => m.default),
  [Locale.ar]: () => import('./ar').then((m) => m.default),
  [Locale.fr]: () => import('./fr').then((m) => m.default),
  [Locale.es]: () => import('./es').then((m) => m.default),
  [Locale.de]: () => import('./de').then((m) => m.default),
})

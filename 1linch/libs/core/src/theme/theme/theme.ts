import { ITheme } from '@1inch-community/models'
import type { CSSResult } from 'lit'

export class Theme implements ITheme {
  constructor(protected readonly colorScheme: CSSResult) {}

  async init(): Promise<void> {}

  applyStyle(): void {}

  destroy(): void {}
}

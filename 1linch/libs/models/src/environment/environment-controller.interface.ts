export interface IEnvironmentController {
  get<K extends keyof IEnvironment>(key: K): IEnvironment[K]
}

export interface IEnvironment {
  production: boolean
  oneInchDevPortalHost: string
  oneInchDevPortalToken?: string
  cloudflareTurnstileSiteKey?: string
  walletConnectProjectId: string
  appVersion?: string
}

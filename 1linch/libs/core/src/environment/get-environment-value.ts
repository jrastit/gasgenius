import { IEnvironment } from '@1inch-community/models'

const requiredEnvFields: (keyof IEnvironment)[] = ['oneInchDevPortalHost', 'walletConnectProjectId']

const env: Partial<IEnvironment> = {
  oneInchDevPortalHost: 'https://api.1inch.dev',
}

let embeddedMode = false

/**
 * @deprecated
 * */
export function getEnvironmentValue<K extends keyof IEnvironment>(valueName: K): IEnvironment[K] {
  if (embeddedMode && env[valueName] === undefined && requiredEnvFields.includes(valueName)) {
    throw new Error(`environment value ${valueName} not exist`)
  }
  return env[valueName]!
}

export function setEnvironmentValue<K extends keyof IEnvironment>(
  valueName: K,
  value: IEnvironment[K]
) {
  env[valueName] = value
}

export function enabledEmbeddedMode() {
  embeddedMode = true
}

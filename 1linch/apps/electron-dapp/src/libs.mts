import type { LogFunctions } from 'electron-log'
import type settingsType from 'electron-settings'
import type { AppUpdater } from 'electron-updater'

import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'url'
const require = createRequire(import.meta.url)

export const settings = require('electron-settings') as typeof settingsType
export const logger = require('electron-log') as LogFunctions
export const { autoUpdater } = require('electron-updater') as { autoUpdater: AppUpdater }
export const { config } = require('dotenv') as { config: () => void }

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

config()

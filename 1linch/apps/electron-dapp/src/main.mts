import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import dotenv from 'dotenv'
import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { __dirname, logger, settings } from './libs.mjs'
import { initUpdater } from './updater.mjs'
dotenv.config()

type WindowBounds = {
  width: number
  height: number
  x: number
  y: number
}

async function createWindow() {
  const { width, height, x, y } = ((await settings.get('windowBounds')) as WindowBounds) ?? {}
  const icon = path.join(__dirname, '../resources/icon.png')
  const mainWindow = new BrowserWindow({
    title: '1inch Community dApp',
    width: width ?? 900,
    height: height ?? 740,
    x: x ?? undefined,
    y: y ?? undefined,
    minWidth: 440,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, './preload.mjs'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', () => {
    logger.log('close window')
    const { width, height, x, y } = mainWindow.getBounds()
    settings.setSync('windowBounds', { width, height, x, y })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_HOST'] && process.env['DEBUG_PROD'] !== 'true') {
    await mainWindow.loadURL(process.env['ELECTRON_RENDERER_HOST'])
    mainWindow.webContents.openDevTools()
  } else {
    await mainWindow.loadFile(path.join(__dirname, 'render/index.electron.html'))
  }
}

app.whenReady().then(async () => {
  initUpdater()
  electronApp.setAppUserModelId('io.1inch')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

import { dialog } from 'electron'
import { autoUpdater, logger } from './libs.mjs'

export function initUpdater() {
  autoUpdater.channel = 'dev'
  autoUpdater
    .checkForUpdates()
    .then(() => {
      logger.info('Update ready')
    })
    .catch((err) => {
      logger.error('Error in auto-updater. ' + err)
    })
  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for update...')
  })
  autoUpdater.on('update-available', async () => {
    logger.info('Update available.')
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: 'A new version is available. Do you want to update now?',
      buttons: ['Update', 'Later'],
    })
    if (result.response === 0) {
      await autoUpdater.downloadUpdate()
    }
  })
  autoUpdater.on('update-not-available', () => {
    logger.info('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    logger.error('Error in auto-updater. ' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    logger.info(log_message)
  })
  autoUpdater.on('update-downloaded', async () => {
    logger.info('Update downloaded')
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'Install and restart now?',
      buttons: ['Yes', 'Later'],
    })
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
}

let container: HTMLElement

export function getContainer() {
  findOrCreateContainer()
  return container
}

function findOrCreateContainer() {
  if (container) return
  const overlayContainer = document.querySelector('#overlay-container') as HTMLElement
  if (!overlayContainer) {
    throw new Error(`Overlay container not init`)
  }
  container = overlayContainer
}

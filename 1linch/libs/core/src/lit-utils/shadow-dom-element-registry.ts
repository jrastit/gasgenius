const shadowDomElementRegistry = new Map<string, HTMLElement>()

export function registerShadowDomElement(id: string, element: HTMLElement) {
  shadowDomElementRegistry.set(id, element)
}

export function unregisterShadowDomElement(id: string) {
  shadowDomElementRegistry.delete(id)
}

export function getShadowDomElement(id: string) {
  return shadowDomElementRegistry.get(id) ?? null
}

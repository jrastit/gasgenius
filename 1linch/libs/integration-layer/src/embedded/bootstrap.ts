import { enabledEmbeddedMode, setEnvironmentValue } from '@1inch-community/core/environment'
import {
  EmbeddedBootstrapConfig,
  EmbeddedControllerType,
  OneInchDevPortal,
} from '@1inch-community/models'
import { bootstrapApplicationContext } from './context'
import { getController } from './embedded-controllers'
import { ElementContainer } from './model/element-container'
import { widgets } from './widgets'

export async function bootstrapEmbedded<
  Config extends EmbeddedBootstrapConfig = EmbeddedBootstrapConfig,
>(config: Config): Promise<EmbeddedControllerType[Config['widgetName']]> {
  enabledEmbeddedMode()
  applyEnvironmentApi(config.oneInchDevPortal)
  const container: HTMLElement | null =
    typeof config.renderContainer === 'string'
      ? document.querySelector(config.renderContainer)
      : config.renderContainer
  const widgetFactory = widgets[config.widgetName]
  if (!(container instanceof HTMLElement)) throw new Error('Container is missing')
  if (!widgetFactory) throw new Error('Widget is missing')
  const containerRect = container.getBoundingClientRect()
  if (containerRect.width < 450) {
    container.innerText = 'The renderContainer width must be at least 450 pixels'
    throw new Error('The renderContainer width must be at least 450 pixels')
  }
  const [contextElement, globalContext] = await bootstrapApplicationContext(config)
  const widgetElementName = await widgetFactory()
  const widgetElement = document.createElement(widgetElementName) as ElementContainer
  await contextElement.setConfig(config)
  contextElement.appendChild(widgetElement)
  container.innerHTML = ''
  container.appendChild(contextElement)
  await widgetElement.setConfig(config)
  const controller = getController(config.widgetName, globalContext, contextElement)
  widgetElement.bindEmbeddedController(controller)
  return controller
}

function applyEnvironmentApi(config: OneInchDevPortal) {
  if (typeof config === 'object') {
    setEnvironmentValue('oneInchDevPortalHost', config.devPortalHost)
    setEnvironmentValue('oneInchDevPortalToken', config.devPortalToken)
    return
  }
  if (config.startsWith('https://')) {
    setEnvironmentValue('oneInchDevPortalHost', config)
    return
  }
  if (config.startsWith('Bearer ')) {
    setEnvironmentValue('oneInchDevPortalToken', config)
    return
  }
}

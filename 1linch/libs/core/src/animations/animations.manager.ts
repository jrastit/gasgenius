import { IAnimationsManager, IApplicationContext } from '@1inch-community/models'
import { lazy } from '../lazy'
import { appendStyle } from '../lit-utils'

const debug = false

export class AnimationsManager implements IAnimationsManager {
  private context?: IApplicationContext

  private readonly setting = lazy(() =>
    this.context!.settings.getSetting('enable-animations', true)
  )

  async init(context: IApplicationContext): Promise<void> {
    this.context = context
    this.enabledGPU().catch()
  }

  async animate(
    element: HTMLElement,
    keyframes: Keyframe[],
    options?: number | KeyframeAnimationOptions
  ): Promise<void> {
    if (!this.setting.value.value) return
    await element.animate(keyframes, options).finished
  }

  async enabledGPU() {
    await Promise.all([this.enabledGPUbyDOMAnimation()])
  }

  async enabledGPUbyDOMAnimation() {
    const element = document.createElement('div')
    appendStyle(element, {
      position: 'fixed',
      width: '0',
      height: '0',
      top: '0',
      left: '0',
      background: debug ? 'red' : '',
    })
    document.body.appendChild(element)
    const keyframes = []

    for (let i = 0; i < 10; i++) {
      const size = 10 * i
      keyframes.push({
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate3d(${size}px, ${size}px, ${size}px) rotate3d(1, 1, 1, 45deg)`,
      })
      keyframes.push({
        width: '10px',
        height: '10px',
        transform: `translate3d(10px, 10px, 10px)`,
        borderRadius: '50%',
      })
    }

    await this.animate(element, keyframes, { duration: 5000 })
  }
}

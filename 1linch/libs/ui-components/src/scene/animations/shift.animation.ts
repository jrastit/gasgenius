import { appendStyle, isSafari } from '@1inch-community/core/lit-utils'
import { Animation } from './animation'

export function shiftAnimation(): Animation {
  const initStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    zIndex: '9',
    backfaceVisibility: 'hidden',
    height: isSafari() ? '110%' : '',
  }
  const resetStyle = {
    position: '',
    top: '',
    left: '',
    bottom: '',
    right: '',
    zIndex: '',
    transform: '',
    filter: '',
    backfaceVisibility: '',
    height: '',
  }
  const DEFAULT_DURATION = 500
  const animationConfig: KeyframeAnimationOptions = {
    duration: DEFAULT_DURATION,
    easing: 'cubic-bezier(.2, .8, .2, 1)',
  }

  return {
    duration: DEFAULT_DURATION,
    preparation: (upLayer: HTMLElement, downLayer: HTMLElement, isBack: boolean) => {
      appendStyle(upLayer, {
        ...initStyle,
        zIndex: '9',
        transform: isBack ? 'translate3d(0, 0, 0)' : 'translate3d(110%, 0, 0)',
      })
      appendStyle(downLayer, {
        ...initStyle,
        zIndex: '8',
        transform: isBack ? 'translate3d(-110%, 0, 0)' : 'translate3d(0, 0, 0)',
      })
    },
    transition: async (
      upLayer: HTMLElement,
      downLayer: HTMLElement,
      isBack: boolean,
      immediate: boolean
    ) => {
      animationConfig.duration = immediate ? 1 : DEFAULT_DURATION

      const upLayerStart = () => ({
        transform: isBack ? 'translate3d(0, 0, 0)' : 'translate3d(110%, 0, 0)',
      })
      const upLayerFinish = () => ({
        transform: isBack ? 'translate3d(110%, 0, 0)' : 'translate3d(0, 0, 0)',
      })

      const downLayerStart = () => ({
        transform: isBack ? 'translate3d(-110%, 0, 0)' : 'translate3d(0, 0, 0)',
      })
      const downLayerFinish = () => ({
        transform: isBack ? 'translate3d(0, 0, 0)' : 'translate3d(-110%, 0, 0)',
      })

      await Promise.all([
        upLayer.animate([upLayerStart(), upLayerFinish()], animationConfig).finished,
        downLayer.animate([downLayerStart(), downLayerFinish()], animationConfig).finished,
      ])

      appendStyle(upLayer, upLayerFinish())
      appendStyle(downLayer, downLayerFinish())
    },
    cleanup: (upLayer: HTMLElement, downLayer: HTMLElement) => {
      appendStyle(upLayer, { ...resetStyle })
      appendStyle(downLayer, { ...resetStyle })
    },
  }
}

import { appendStyle, isSafari } from '@1inch-community/core/lit-utils'
import { Animation } from './animation'

export function slideAnimation(): Animation {
  const initStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    zIndex: '9',
    backfaceVisibility: 'hidden',
    height: isSafari() ? '100%' : '',
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
    willChange: '',
    height: '',
  }
  const DEFAULT_DURATION = 500
  const SKIP_SCALE = true
  const OFFSET = '50%'

  const animationConfig: KeyframeAnimationOptions = {
    duration: DEFAULT_DURATION,
    easing: 'cubic-bezier(0.36, 0.66, 0.04, 1)',
  }

  const scale = (isBack: boolean) => {
    if (SKIP_SCALE) return ''
    return `scale(${isBack ? 1 : 0.9})`
  }

  return {
    duration: DEFAULT_DURATION,
    preparation: (upLayer: HTMLElement, downLayer: HTMLElement, isBack: boolean) => {
      appendStyle(upLayer, {
        ...initStyle,
        zIndex: '9',
        willChange: 'transform',
        transform: isBack ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
      })
      appendStyle(downLayer, {
        ...initStyle,
        zIndex: '8',
        willChange: 'transform',
        transform: isBack
          ? `translate3d(-${OFFSET}, 0, 0) ${scale(false)}`
          : `translate3d(0, 0, 0) ${scale(true)}`,
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
        transform: isBack ? 'translate3d(0, 0, 0)' : 'translate3d(105%, 0, 0)',
      })
      const upLayerFinish = () => ({
        transform: isBack ? 'translate3d(105%, 0, 0)' : 'translate3d(0, 0, 0)',
      })

      const downLayerStart = () => ({
        transform: isBack
          ? `translate3d(-${OFFSET}, 0, 0) ${scale(false)}`
          : `translate3d(0, 0, 0) ${scale(true)}`,
      })
      const downLayerFinish = () => ({
        transform: isBack
          ? `translate3d(0, 0, 0) ${scale(true)}`
          : `translate3d(-${OFFSET}, 0, 0) ${scale(false)}`,
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

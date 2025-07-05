import { InitializingEntity } from '../base'

export interface IAnimationsManager extends InitializingEntity {
  animate(
    element: HTMLElement,
    keyframes: Keyframe[],
    options?: number | KeyframeAnimationOptions
  ): Promise<void>
}

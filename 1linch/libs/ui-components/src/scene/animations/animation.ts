export type Animation = {
  readonly duration: number
  preparation(upLayer: HTMLElement, downLayer: HTMLElement, isBack: boolean): void
  transition(
    upLayer: HTMLElement,
    downLayer: HTMLElement,
    isBack: boolean,
    immediate: boolean
  ): Promise<void>
  cleanup(upLayer: HTMLElement, downLayer: HTMLElement, isBack: boolean): void
}

import { asyncFrame } from '@1inch-community/core/async'
import { appendStyle } from '@1inch-community/core/lit-utils'
import { html, render, TemplateResult } from 'lit'
import { distinctUntilChanged, map, Observable, shareReplay, startWith, Subject } from 'rxjs'
import { ScrollViewProviderElement } from '../scroll'
import { slideAnimation } from './animations'
import { Animation } from './animations/animation'
import { SceneWrapperElement } from './scene-wrapper.element'
import { sceneStyle } from './scene.style'

export type RenderConfig<T extends string> = Record<T, () => TemplateResult>

export type SceneConfig<T extends string> = Record<T, SceneConfigItem>

interface SceneConfigItem {
  minWidth?: number | string
  maxWidth?: number | string
  minHeight?: number | string
  maxHeight?: number | string
  lazyRender?: boolean
}

export class SceneController<T extends string, U extends T> {
  static styles = sceneStyle

  private currentScenes?: RenderConfig<T>

  private readonly takeUpdate$ = new Subject<void>()

  private sceneStack: T[] = []

  private readonly sceneContainer = buildSceneContainer()

  private transitionInProgress = false

  get activeScene(): T {
    return this.sceneStack[this.sceneStack.length - 1]
  }

  readonly currentSceneName$: Observable<T> = this.takeUpdate$.pipe(
    startWith(null),
    map(() => this.getCurrentSceneName()),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(
    private readonly rootSceneName: U,
    private readonly config: SceneConfig<T>,
    private readonly animation: Animation = slideAnimation()
  ) {
    this.sceneStack.push(rootSceneName)
  }

  render(config: RenderConfig<T>): TemplateResult {
    if (this.transitionInProgress) {
      return html`${this.sceneContainer}`
    }
    const isFirstRender = !this.currentScenes
    this.currentScenes = config
    const sceneName = this.getCurrentSceneName()
    const currentSceneConfig = this.config[sceneName]
    const isLazyRenderScene = currentSceneConfig.lazyRender ?? false
    if (!isLazyRenderScene || isFirstRender) {
      const sceneFactory = this.getScene(sceneName)
      if (!sceneFactory) {
        throw new Error(`Scene not exist`)
      }
      const sceneWrapper = this.buildSceneWrapper(sceneFactory(), sceneName)
      this.clearContainer()
      this.sceneContainerAppendChild(sceneWrapper)
      this.applySceneConfigBySceneName(sceneName)
    }
    this.takeUpdate$.next()
    return html`${this.sceneContainer}`
  }

  async nextTo(sceneName: T, immediate: boolean = false) {
    if (this.transitionInProgress) {
      return
    }
    this.sceneStack.push(sceneName)
    await this.transition(sceneName, false, immediate)
    this.takeUpdate$.next()
  }

  async back() {
    if (this.transitionInProgress) {
      return
    }
    const sceneName = (this.sceneStack[this.sceneStack.length - 2] ?? this.rootSceneName) as T

    if (this.sceneStack.length > 1) {
      this.sceneStack.pop()
    }

    await this.transition(sceneName, true)
    this.takeUpdate$.next()
  }

  resetScene() {
    this.sceneStack = [this.rootSceneName]
    this.takeUpdate$.next()
  }

  getCurrentSceneName(): T {
    let currentScene: T = this.rootSceneName
    if (this.sceneContainer.firstChild) {
      currentScene = (this.sceneContainer.firstChild as HTMLElement).id as T
    }
    return currentScene
  }

  private async transition(sceneName: T, isBack: boolean = false, immediate: boolean = false) {
    this.transitionInProgress = true
    try {
      const currentScene = this.getCurrentSceneName()
      if (currentScene === sceneName) {
        return
      }
      const nextSceneFactory = this.getScene(sceneName)
      if (!nextSceneFactory) {
        throw new Error(`Scene ${sceneName} not exist`)
      }
      const nextSceneWrapper = this.buildSceneWrapper(nextSceneFactory(), sceneName)
      const currentSceneWrapper = this.sceneContainer.firstChild as SceneWrapperElement

      appendStyle(currentSceneWrapper, {
        pointerEvents: 'none',
      })
      appendStyle(nextSceneWrapper, {
        pointerEvents: 'none',
      })

      const upScene = isBack ? currentSceneWrapper : nextSceneWrapper
      const downScene = !isBack ? currentSceneWrapper : nextSceneWrapper

      isBack ? upScene.animationOutStart() : upScene.animationInStart()
      isBack ? downScene.animationOutStart() : downScene.animationInStart()

      this.sceneContainerAppendChild(nextSceneWrapper)
      await asyncFrame()
      const nextSceneWrapperRect = nextSceneWrapper.getBoundingClientRect()
      const currentSceneWrapperRect = currentSceneWrapper.getBoundingClientRect()
      this.animation.preparation(upScene, downScene, isBack ?? false)
      if (nextSceneWrapperRect.height > currentSceneWrapperRect.height) {
        this.applySceneConfigBySceneName(sceneName)
      }
      const duration = this.animation.duration
      await Promise.all([
        this.animation.transition(upScene, downScene, isBack ?? false, immediate),
        this.resizeContainer(nextSceneWrapperRect, currentSceneWrapperRect, immediate, duration),
      ])
      if (nextSceneWrapperRect.height < currentSceneWrapperRect.height) {
        this.applySceneConfigBySceneName(sceneName)
      }
      appendStyle(this.sceneContainer, {
        width: '',
        height: '',
      })
      appendStyle(currentSceneWrapper, {
        pointerEvents: '',
      })
      appendStyle(nextSceneWrapper, {
        pointerEvents: '',
      })
      this.sceneContainer.firstChild &&
        this.sceneContainer.removeChild(this.sceneContainer.firstChild)

      this.animation.cleanup(upScene, downScene, isBack ?? false)
      isBack ? upScene.animationOutEnd() : upScene.animationInEnd()
      isBack ? downScene.animationOutEnd() : downScene.animationInEnd()
    } finally {
      this.transitionInProgress = false
    }
  }

  private getScene(sceneName: T) {
    if (!this.currentScenes) {
      return null
    }
    return this.currentScenes[sceneName] ?? null
  }

  private clearContainer() {
    while (this.sceneContainer.firstChild) {
      this.sceneContainer.removeChild(this.sceneContainer.firstChild)
    }
  }

  private buildSceneWrapper(content: TemplateResult, name: string): SceneWrapperElement {
    const sceneWrapper = document.createElement(SceneWrapperElement.tagName) as SceneWrapperElement
    sceneWrapper.id = name
    sceneWrapper.classList.add('scene-wrapper', name)
    render(content, sceneWrapper)
    return sceneWrapper
  }

  private sceneContainerAppendChild(sceneWrapper: HTMLElement) {
    this.sceneContainer.appendChild(sceneWrapper)
  }

  private applySceneConfigBySceneName(sceneName: T) {
    const config = this.config[sceneName]
    this.applySceneSizes(config)
  }

  private applySceneSizes(config: SceneConfigItem) {
    const formatValue = (value?: number | string) => {
      if (!value) {
        return ''
      }
      return typeof value === 'number' ? `${value}px` : value
    }
    if (config.maxHeight) {
      this.sceneContainer.maxHeight = parseInt(config.maxHeight.toString())
    }
    appendStyle(this.sceneContainer, {
      minWidth: formatValue(config.minWidth),
      maxWidth: formatValue(config.maxWidth),
    })
  }

  private async resizeContainer(
    nextRect: DOMRect,
    currentRect: DOMRect,
    immediate: boolean,
    duration: number
  ) {
    const fromKeyframe: Record<string, string> = {
      height: `${currentRect.height}px`,
      width: `${currentRect.width}px`,
    }
    const toKeyframe: Record<string, string> = {
      height: `${nextRect.height}px`,
      width: `${nextRect.width}px`,
    }
    appendStyle(this.sceneContainer, fromKeyframe)
    await this.sceneContainer.animate([fromKeyframe, toKeyframe], {
      duration: immediate ? 1 : duration,
      easing: 'cubic-bezier(.2, .8, .2, 1)',
    }).finished

    appendStyle(this.sceneContainer, toKeyframe)
  }
}

function buildSceneContainer() {
  const sceneContainer = document.createElement(ScrollViewProviderElement.tagName)
  sceneContainer.id = 'scene-container'
  sceneContainer.classList.add('scene-container')
  return sceneContainer
}

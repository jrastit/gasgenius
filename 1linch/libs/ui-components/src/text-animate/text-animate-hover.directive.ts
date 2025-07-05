import { objectsDeepEqual } from '@1inch-community/core/utils'
import { Part } from 'lit'
import { AsyncDirective } from 'lit/async-directive.js'
import { directive, DirectiveResult, PartType } from 'lit/directive.js'
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  Observable,
  startWith,
  Subscription,
  tap,
} from 'rxjs'
import { TextAnimateElement } from './text-animate.element'

type TextAnimateHoverDirectiveOptions = {
  target: () => HTMLElement | undefined
  text$: Observable<string | DirectiveResult>
  hoverText$: Observable<string | DirectiveResult | undefined>
}

class TextAnimateHoverDirective extends AsyncDirective {
  private part: TextAnimateElement | null = null
  private subscription?: Subscription

  update(part: Part, props: unknown[]) {
    if (part.type !== PartType.ELEMENT) {
      throw new Error('textAnimateHover can only be used like inch-text-animate elements directive')
    }
    if (part.element.tagName.toLowerCase() !== TextAnimateElement.tagName.toLowerCase()) {
      throw new Error('textAnimateHover can only be applied to inch-text-animate elements')
    }
    this.part = part.element as TextAnimateElement
    return super.update(part, props)
  }

  render(options: TextAnimateHoverDirectiveOptions) {
    const target = options.target()
    if (!this.isConnected || !target) {
      return
    }

    const mouse$ = merge(
      fromEvent(target, 'mouseenter').pipe(map(() => true)),
      fromEvent(target, 'mouseleave').pipe(map(() => false))
    ).pipe(debounceTime(200), startWith(false))
    const text$ = combineLatest([options.text$, options.hoverText$, mouse$]).pipe(
      distinctUntilChanged(objectsDeepEqual),
      tap(([text, hoverText, isHover]) => {
        if (!this.part) return
        if (isHover && !hoverText) {
          return
        }
        this.part.text = (isHover ? hoverText : text) as string
        this.part.requestUpdate()
      })
    )

    this.subscription = text$.subscribe()
  }

  disconnected() {
    this.subscription?.unsubscribe()
  }
}

export const textAnimateHover = directive(TextAnimateHoverDirective)

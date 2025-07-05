import { debounceTime, firstValueFrom, fromEvent, map } from 'rxjs'

export async function scrollEnd(element: HTMLElement): Promise<void> {
  const stream$ = fromEvent(element, 'scroll').pipe(
    debounceTime(60),
    map(() => void 0),
    debounceTime(100)
  )
  return firstValueFrom(stream$)
}

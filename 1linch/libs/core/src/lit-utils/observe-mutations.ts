import { Observable } from 'rxjs'

export function observeMutations(
  target: Node,
  options: MutationObserverInit
): Observable<MutationRecord[]> {
  return new Observable((subscriber) => {
    const observer = new MutationObserver((mutations) => {
      subscriber.next(mutations)
    })

    observer.observe(target, options)

    return () => {
      observer.disconnect()
    }
  })
}

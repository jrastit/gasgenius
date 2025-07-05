export function debounceTime(ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (_: unknown, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: unknown[]) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        originalMethod.apply(this, args)
        timer = null
      }, ms)
    }

    return descriptor
  }
}

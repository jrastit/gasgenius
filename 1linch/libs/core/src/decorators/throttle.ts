export function throttle(ms: number) {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const lockMap = new WeakMap<object, boolean>()

    descriptor.value = function (this: object, ...args: any[]) {
      if (lockMap.get(this)) return

      originalMethod.apply(this, args)
      lockMap.set(this, true)

      setTimeout(() => {
        lockMap.set(this, false)
      }, ms)
    }

    return descriptor
  }
}

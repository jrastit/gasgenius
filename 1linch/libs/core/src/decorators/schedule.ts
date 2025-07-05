type ScheduleMethod<Args extends any[], Result> = (...args: Args) => Promise<Result>
type Accumulator<T extends any[]> = (accumulator: T | null, currentValue: T) => T

export function Schedule<Ctx extends object, Args extends any[], Result>(
  debounceTime: number,
  accumulator: Accumulator<Args>
) {
  return function (
    target: Ctx,
    fieldName: string,
    descriptor: TypedPropertyDescriptor<ScheduleMethod<Args, Result>>
  ) {
    const originalMethod = descriptor.value
    let accumulatorArgs: Args | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    let pending: Promise<Result> | null = null

    if (!originalMethod) throw new Error(`${fieldName} is undefined.`)

    descriptor.value = function (this: Ctx, ...args: Args): Promise<Result> {
      accumulatorArgs = accumulator(accumulatorArgs, args)
      if (pending) return pending as Promise<Result>

      pending = new Promise<Result>((resolve, reject) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          originalMethod
            .apply(this, accumulatorArgs!)
            .then((result) => {
              resolve(result)
            })
            .catch((error) => {
              reject(error)
            })
          accumulatorArgs = null
          timer = null
          pending = null
        }, debounceTime)
      })

      return pending
    }
  }
}

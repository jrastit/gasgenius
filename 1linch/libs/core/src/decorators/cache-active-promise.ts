type AsyncMethod<Args extends any[] = any[], R = any> = (...args: Args) => Promise<R>

class CacheActivePromiseError extends Error {
  constructor(text: string) {
    super(text)
  }
}

export function CacheActivePromise<Ctx extends object, Method extends AsyncMethod = AsyncMethod>(
  argumentSerializer?: (...args: Parameters<Method>) => string
) {
  const cacheStorage = new WeakMap<Ctx, Map<string, Promise<unknown>>>()

  const getCache = (ctx: Ctx): Map<string, Promise<unknown>> => {
    let cache = cacheStorage.get(ctx)
    if (!cache) {
      cache = new Map<string, Promise<unknown>>()
      cacheStorage.set(ctx, cache)
    }
    return cache
  }

  return function CacheActivePromiseDecorator(
    ctx: { constructor: { name: string } },
    fieldName: string,
    propertyDescriptor: TypedPropertyDescriptor<Method>
  ): TypedPropertyDescriptor<Method> {
    const ctxName = ctx?.constructor?.name ?? ''
    const method: Method | undefined = propertyDescriptor.value

    if (method === undefined) {
      throw new CacheActivePromiseError(`Method ${fieldName} is undefined.`)
    }

    if (typeof method !== 'function') {
      throw new CacheActivePromiseError(`${fieldName} is not a function`)
    }

    propertyDescriptor.value = function (this: Ctx, ...args: Parameters<Method>) {
      const cache = getCache(this)
      const keyArgs = argumentSerializer
        ? argumentSerializer(...args)
        : JSON.stringify(args, stringifyReplacer)
      const key = `${ctxName}.${fieldName}(${keyArgs})`

      if (cache.has(key)) {
        return cache.get(key)
      }

      const result: Promise<unknown> = method.apply(this, args).finally(() => cache.delete(key))

      if (typeof result.then !== 'function') {
        throw new CacheActivePromiseError(`Method ${fieldName} return not promise`)
      }

      cache.set(key, result)
      return result
    } as Method

    return propertyDescriptor
  }
}

function stringifyReplacer(_: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value
}

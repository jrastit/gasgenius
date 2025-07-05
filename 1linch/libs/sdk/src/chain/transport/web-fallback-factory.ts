import { Subject } from 'rxjs'
import { Chain, createTransport, FallbackTransport, http, Transport, webSocket } from 'viem'

export interface WebFallbackTransportConfig {
  key?: string
  name?: string
}

interface RpcConfig {
  batchSize: number
}

export type HTTPS = `https://${string}`
export type WS = `wss://${string}`
export type RPC_URL = HTTPS | WS
export type RPC = RPC_URL | { rpc: RPC_URL; config: RpcConfig }

interface TransportHolder {
  type: 'ws' | 'http'
  chain: Chain
  rpc: RPC_URL
  config: RpcConfig
  transport: ReturnType<Transport>
  success: boolean
  time: number
  countErrors: number
}

export function webFallback(
  chain: Chain,
  rpcList: RPC[],
  config?: WebFallbackTransportConfig
): FallbackTransport {
  const { key = 'fallback', name = 'Fallback' } = config ?? {}
  const transportHolders: TransportHolder[] = buildTransportHolderList(chain, rpcList)
  let assessmentCompleted = false
  const assessmentCompletedSignal = new Subject<void>()

  const benchMartTransports = async () => {
    await Promise.all(transportHolders.map(benchMartTransport))
    assessmentCompleted = true
    assessmentCompletedSignal.next()
  }

  const getBestTransport = (): { http?: TransportHolder; ws?: TransportHolder } => {
    const bestTransport: { http?: TransportHolder; ws?: TransportHolder } = {
      http: undefined,
      ws: undefined,
    }

    const check = (holder: TransportHolder) => {
      if (!holder.success) {
        return
      }
      if (!bestTransport[holder.type]) {
        bestTransport[holder.type] = holder
        return
      }
      if (!assessmentCompleted) {
        return
      }
      if (bestTransport[holder.type]!.countErrors < holder.countErrors) {
        return
      }
      if (bestTransport[holder.type]!.time > holder.time) {
        bestTransport[holder.type] = holder
      }
    }

    for (const holders of transportHolders) {
      check(holders)
    }

    return bestTransport
  }

  benchMartTransports().then()

  return (() => {
    return createTransport(
      {
        key,
        name,
        type: 'fallback',
        request: async ({ method, params }): Promise<any> => {
          const fetch = async () => {
            const { http, ws } = getBestTransport()
            try {
              const result = await Promise.any([
                http
                  ? request(http, method, params)
                  : Promise.reject(new Error('No http transports available')),
                ws
                  ? request(ws, method, params)
                  : Promise.reject(new Error('No ws transports available')),
              ])
              return result
            } catch (error) {
              if (error instanceof AggregateError) {
                return
              }
              throw error
            }
          }

          return fetch()

          // const fetch = async (i = 0, error?: Error): Promise<any> => {
          //   const transports: ReturnType<Transport>[] = activeTransports
          //     .slice(i, (i + parallelRequests))
          //     .map(transport => transport({
          //       ...rest,
          //       chain,
          //       retryCount: 0,
          //       timeout
          //     }));
          //   if (!transports.length) {
          //     throw error ?? new Error('No transports available');
          //   }
          //   try {
          //     const [response, transport] = await Promise.any<[unknown, ReturnType<Transport>]>(transports.map(async transport => {
          //       const result = await transport.request({
          //         method,
          //         params
          //       });
          //       return [result, transport] as [unknown, ReturnType<Transport>];
          //     }));
          //
          //     return response;
          //   } catch (err) {
          //
          //     if (err instanceof TimeoutError) {
          //       // if (shouldThrow(err as Error)) throw err;
          //
          //       // If we've reached the end of the fallbacks, throw the error.
          //       if (i === activeTransports.length - 1) throw err;
          //
          //       // Otherwise, try the next fallback.
          //       return fetch(i + parallelRequests, error);
          //     }
          //     if (!evaluateTransportsInProgress) {
          //       await evaluateTransports();
          //       return fetch();
          //     }
          //     return fetch(i + parallelRequests, error);
          //   }
          // };
          // return fetch();
        },
      },
      {
        transports: transportHolders
          .sort((holder) => (holder.type === 'ws' ? -1 : 1))
          .map((holder) => holder.transport),
      }
    )
  }) as unknown as FallbackTransport
}

async function benchMartTransport(transportHolder: TransportHolder): Promise<void> {
  const { rpc, config, chain, type, transport } = transportHolder
  const _transport =
    type === 'ws'
      ? transport
      : buildTransport(chain, buildTransportFactory(rpc, { ...config, batchSize: false }))
  const start = Date.now()
  let end: number
  try {
    transportHolder.success = await _transport.request({ method: 'net_listening' })
  } catch {
    transportHolder.success = false
  } finally {
    end = Date.now()
    transportHolder.time = end - start
  }
}

const defaultConfig: RpcConfig = {
  batchSize: 100,
}

function buildTransportHolderList(chain: Chain, rpcList: RPC[]): TransportHolder[] {
  return rpcList.map((rpcAndConfig) => {
    const rpc = typeof rpcAndConfig === 'string' ? rpcAndConfig : rpcAndConfig.rpc
    const config = typeof rpcAndConfig === 'string' ? defaultConfig : rpcAndConfig.config
    return {
      chain,
      rpc,
      config,
      countErrors: 0,
      type: rpc.startsWith('https://') ? 'http' : 'ws',
      transport: buildTransport(chain, buildTransportFactory(rpc, config)),
      success: true,
      time: Infinity,
    }
  })
}

function buildTransportFactory(
  rpc: RPC_URL,
  config: Omit<RpcConfig, 'batchSize'> & {
    batchSize: number | false
  }
): Transport {
  if (rpc.startsWith('https://')) {
    return http(rpc, {
      retryCount: 0,
      timeout: 3_000,
      batch:
        config.batchSize === false
          ? undefined
          : {
              batchSize: config.batchSize,
              wait: 300,
            },
    })
  }
  if (rpc.startsWith('wss://')) {
    return webSocket(rpc, {
      retryCount: 1,
      retryDelay: 1_000,
      timeout: 10_000,
      reconnect: false,
    })
  }
  throw new Error(`Unsupported RPC URL ${rpc}`)
}

function buildTransport(chain: Chain, transportFactory: Transport): ReturnType<Transport> {
  return transportFactory({
    chain,
    retryCount: 0,
    timeout: 2_000,
    pollingInterval: 0,
  })
}

async function request(
  transportHolder: TransportHolder,
  method: string,
  params?: unknown
): Promise<unknown> {
  const { transport } = transportHolder
  return await transport
    .request({ method, params }, { dedupe: true, retryCount: 0 })
    .catch((err) => {
      transportHolder.countErrors++
      return Promise.reject(err)
    })
}

// import {
//   TransactionRejectedRpcError,
//   UserRejectedRequestError,
// } from '../../errors/rpc.js'
// import type { ErrorType } from '../../errors/utils.js'
// import type { Chain } from '../../types/chain.js'
// import { wait } from '../../utils/wait.js'
//
// import {
//   type CreateTransportErrorType,
//   type Transport,
//   type TransportConfig,
//   createTransport,
// } from './createTransport.js'
// // TODO: Narrow `method` & `params` types.
// export type OnResponseFn = (
//   args: {
//     method: string
//     params: unknown[]
//     transport: ReturnType<Transport>
//   } & (
//     | {
//     error?: undefined
//     response: unknown
//     status: 'success'
//   }
//     | {
//     error: Error
//     response?: undefined
//     status: 'error'
//   }
//     ),
// ) => void
//
// type RankOptions = {
//   /**
//    * The polling interval (in ms) at which the ranker should ping the RPC URL.
//    * @default client.pollingInterval
//    */
//   interval?: number | undefined
//   /**
//    * Ping method to determine latency.
//    */
//   ping?: (parameters: { transport: ReturnType<Transport> }) =>
//     | Promise<unknown>
//     | undefined
//   /**
//    * The number of previous samples to perform ranking on.
//    * @default 10
//    */
//   sampleCount?: number | undefined
//   /**
//    * Timeout when sampling transports.
//    * @default 1_000
//    */
//   timeout?: number | undefined
//   /**
//    * Weights to apply to the scores. Weight values are proportional.
//    */
//   weights?:
//     | {
//     /**
//      * The weight to apply to the latency score.
//      * @default 0.3
//      */
//     latency?: number | undefined
//     /**
//      * The weight to apply to the stability score.
//      * @default 0.7
//      */
//     stability?: number | undefined
//   }
//     | undefined
// }
//
// export type FallbackTransportConfig = {
//   /** The key of the Fallback transport. */
//   key?: TransportConfig['key'] | undefined
//   /** The name of the Fallback transport. */
//   name?: TransportConfig['name'] | undefined
//   /** Toggle to enable ranking, or rank options. */
//   rank?: boolean | RankOptions | undefined
//   /** The max number of times to retry. */
//   retryCount?: TransportConfig['retryCount'] | undefined
//   /** The base delay (in ms) between retries. */
//   retryDelay?: TransportConfig['retryDelay'] | undefined
// }
//
// export type FallbackTransport<
//   transports extends readonly Transport[] = readonly Transport[],
// > = Transport<
//   'fallback',
//   {
//     onResponse: (fn: OnResponseFn) => void
//     transports: {
//       [key in keyof transports]: ReturnType<transports[key]>
//     }
//   }
// >
//
// export type FallbackTransportErrorType = CreateTransportErrorType | ErrorType
//
// export function fallback<const transports extends readonly Transport[]>(
//   transports_: transports,
//   config: FallbackTransportConfig = {},
// ): FallbackTransport<transports> {
//   const {
//     key = 'fallback',
//     name = 'Fallback',
//     rank = false,
//     retryCount,
//     retryDelay,
//   } = config
//   return (({ chain, pollingInterval = 4_000, timeout, ...rest }) => {
//     let transports = transports_
//
//     let onResponse: OnResponseFn = () => {}
//
//     const transport = createTransport(
//       {
//         key,
//         name,
//         async request({ method, params }) {
//           const fetch = async (i = 0): Promise<any> => {
//             const transport = transports[i]({
//               ...rest,
//               chain,
//               retryCount: 0,
//               timeout,
//             })
//             try {
//               const response = await transport.request({
//                 method,
//                 params,
//               } as any)
//
//               onResponse({
//                 method,
//                 params: params as unknown[],
//                 response,
//                 transport,
//                 status: 'success',
//               })
//
//               return response
//             } catch (err) {
//               onResponse({
//                 error: err as Error,
//                 method,
//                 params: params as unknown[],
//                 transport,
//                 status: 'error',
//               })
//
//               if (shouldThrow(err as Error)) throw err
//
//               // If we've reached the end of the fallbacks, throw the error.
//               if (i === transports.length - 1) throw err
//
//               // Otherwise, try the next fallback.
//               return fetch(i + 1)
//             }
//           }
//           return fetch()
//         },
//         retryCount,
//         retryDelay,
//         type: 'fallback',
//       },
//       {
//         onResponse: (fn: OnResponseFn) => (onResponse = fn),
//         transports: transports.map((fn) => fn({ chain, retryCount: 0 })),
//       },
//     )
//
//     if (rank) {
//       const rankOptions = (typeof rank === 'object' ? rank : {}) as RankOptions
//       rankTransports({
//         chain,
//         interval: rankOptions.interval ?? pollingInterval,
//         onTransports: (transports_) => (transports = transports_ as transports),
//         ping: rankOptions.ping,
//         sampleCount: rankOptions.sampleCount,
//         timeout: rankOptions.timeout,
//         transports,
//         weights: rankOptions.weights,
//       })
//     }
//     return transport
//   }) as FallbackTransport<transports>
// }
//
// function shouldThrow(error: Error) {
//   if ('code' in error && typeof error.code === 'number') {
//     if (
//       error.code === TransactionRejectedRpcError.code ||
//       error.code === UserRejectedRequestError.code ||
//       error.code === 5000 // CAIP UserRejectedRequestError
//     )
//       return true
//   }
//   return false
// }
//
// /** @internal */
// export function rankTransports({
//                                  chain,
//                                  interval = 4_000,
//                                  onTransports,
//                                  ping,
//                                  sampleCount = 10,
//                                  timeout = 1_000,
//                                  transports,
//                                  weights = {},
//                                }: {
//   chain?: Chain | undefined
//   interval: RankOptions['interval']
//   onTransports: (transports: readonly Transport[]) => void
//   ping?: RankOptions['ping'] | undefined
//   sampleCount?: RankOptions['sampleCount'] | undefined
//   timeout?: RankOptions['timeout'] | undefined
//   transports: readonly Transport[]
//   weights?: RankOptions['weights'] | undefined
// }) {
//   const { stability: stabilityWeight = 0.7, latency: latencyWeight = 0.3 } =
//     weights
//
//   type SampleData = { latency: number; success: number }
//   type Sample = SampleData[]
//   const samples: Sample[] = []
//
//   const rankTransports_ = async () => {
//     // 1. Take a sample from each Transport.
//     const sample: Sample = await Promise.all(
//       transports.map(async (transport) => {
//         const transport_ = transport({ chain, retryCount: 0, timeout })
//
//         const start = Date.now()
//         let end: number
//         let success: number
//         try {
//           await (ping
//             ? ping({ transport: transport_ })
//             : transport_.request({ method: 'net_listening' }))
//           success = 1
//         } catch {
//           success = 0
//         } finally {
//           end = Date.now()
//         }
//         const latency = end - start
//         return { latency, success }
//       }),
//     )
//
//     // 2. Store the sample. If we have more than `sampleCount` samples, remove
//     // the oldest sample.
//     samples.push(sample)
//     if (samples.length > sampleCount) samples.shift()
//
//     // 3. Calculate the max latency from samples.
//     const maxLatency = Math.max(
//       ...samples.map((sample) =>
//         Math.max(...sample.map(({ latency }) => latency)),
//       ),
//     )
//
//     // 4. Calculate the score for each Transport.
//     const scores = transports
//       .map((_, i) => {
//         const latencies = samples.map((sample) => sample[i].latency)
//         const meanLatency =
//           latencies.reduce((acc, latency) => acc + latency, 0) /
//           latencies.length
//         const latencyScore = 1 - meanLatency / maxLatency
//
//         const successes = samples.map((sample) => sample[i].success)
//         const stabilityScore =
//           successes.reduce((acc, success) => acc + success, 0) /
//           successes.length
//
//         if (stabilityScore === 0) return [0, i]
//         return [
//           latencyWeight * latencyScore + stabilityWeight * stabilityScore,
//           i,
//         ]
//       })
//       .sort((a, b) => b[0] - a[0])
//
//     // 5. Sort the Transports by score.
//     onTransports(scores.map(([, i]) => transports[i]))
//
//     // 6. Wait, and then rank again.
//     await wait(interval)
//     rankTransports_()
//   }
//   rankTransports_()
// }

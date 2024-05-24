export type ClearablePromiseOptions = {
  milliseconds: number
  message?: string | Error | false
  readonly customTimers?: {
    setTimeout: typeof globalThis.setTimeout
    clearTimeout: typeof globalThis.clearTimeout
  }
  signal?: globalThis.AbortSignal
}

/**
 * @desc 超时错误类
 */
export class TimeoutError extends Error {
  name: string
  constructor(message?: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * @desc Abort 错误类
 */
export class AbortError extends Error {
  name: string
  message: string
  constructor(message: string) {
    super(message)
    this.name = 'AbortError'
    this.message = message
  }
}

/**
 * @desc 获取dom异常信息
 * @param {string} errorMessage
 * @returns { AbortError | DOMException }
 */
const getDomException = (
  errorMessage: string
): AbortError | DOMException => {
  return globalThis.DOMException === undefined
    ? new AbortError(errorMessage)
    : new DOMException(errorMessage)
}

/**
 *
 * @param {AbortSignal} signal
 * @returns
 */
const getAbortedReason = (signal: AbortSignal) => {
  const reason =
    signal.reason === undefined
      ? getDomException('This operation was aborted')
      : signal.reason
  return reason instanceof Error
    ? reason
    : getDomException(reason)
}

export function promiseTimeout<V = any>(
  inputPromise: PromiseLike<V>,
  options: ClearablePromiseOptions
) {
  const {
    milliseconds,
    message,
    customTimers = { setTimeout, clearTimeout }
  } = options

  let timer: ReturnType<typeof setTimeout> | undefined

  const wrappedPromise = new Promise<V | void>(
    (resolve, reject) => {
      const { signal } = options
      if (signal) {
        if (signal.aborted) {
          reject(getAbortedReason(signal))
        }

        signal.addEventListener('abort', () => {
          reject(getAbortedReason(signal))
        })
      }

      if (milliseconds === Number.POSITIVE_INFINITY) {
        inputPromise.then(resolve, reject)
        return
      }

      timer = customTimers.setTimeout.call(
        undefined,
        () => {
          if (message === false) {
            resolve()
          } else if (message instanceof Error) {
            reject(message)
          } else {
            const timeoutError = new TimeoutError()
            timeoutError.message =
              message ??
              `Promise timed out after ${milliseconds} milliseconds`
            reject(timeoutError)
          }
        },
        milliseconds
      )

      ;(async () => {
        try {
          const inputPromiseResult = await inputPromise
          resolve(inputPromiseResult)
        } catch (error) {
          reject(error)
        }
      })()
    }
  )

  /**
   * @desc 默认清除定时器
   */
  const cancelablePromise = wrappedPromise.finally(() => {
    customTimers.clearTimeout.call(undefined, timer)
    timer = undefined
  })

  return cancelablePromise
}

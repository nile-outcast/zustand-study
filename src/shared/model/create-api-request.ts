import type { ApiCallResponse } from '@/shared/types/api-call'
import type { BaseObject, Nullable } from '../types/basic'

type ApiCallConfig = Partial<{
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  baseUrl: string
  headers: BaseObject
}>

type ApiCallArgs<Body extends BaseObject> = Partial<{
  query: BaseObject
  body: Body
}>

interface ApiRequestHandle<D, E extends Error = Error> {
  call: <Body extends BaseObject = BaseObject>(
    params: ApiCallArgs<Body>,
  ) => Promise<ApiCallResponse<D, E>>
  cancel: () => void
  isPending: () => boolean
}

function buildUrl(path: string, query?: BaseObject): string {
  if (!query || Object.keys(query).length === 0) {
    return path
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    params.append(key, String(value))
  }

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${params.toString()}`
}

async function safeParse<T>(response: Response): Promise<T | undefined> {
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return undefined
  }

  try {
    return await response.json()
  } catch {
    return undefined
  }
}

/**
 * Фабрика для выполнения HTTP-запросов с автоматической обработкой ошибок и отменой.
 *
 * @param path — URL или путь (без query-параметров)
 * @param config — опциональный метод, заголовки
 * @returns объект с методом call(), cancel() и isPending()
 */
export function createApiRequest<D, E extends Error = Error>(
  path: string,
  config: ApiCallConfig = {},
): ApiRequestHandle<D, E> {
  const baseUrl = config.baseUrl ?? ''
  let controller: Nullable<AbortController> = null

  return {
    async call({ query, body }) {
      controller?.abort()
      controller = new AbortController()

      try {
        const url = buildUrl(`${baseUrl}${path}`, query)

        const response = await fetch(url, {
          method: config.method ?? 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: controller.signal,
        })

        if (!response.ok) {
          return {
            isError: true,
            status: response.status,
            data: await safeParse<E>(response),
          }
        }

        return {
          isError: false,
          status: response.status,
          data: await response.json(),
        }
      } catch (rawError) {
        if (controller?.signal.aborted) {
          return {
            isError: true,
            isCancelled: true,
            rawError,
          }
        }

        return {
          isError: true,
          rawError,
        }
      } finally {
        controller = null
      }
    },

    cancel: () => controller?.abort(),
    isPending: () => controller !== null,
  }
}

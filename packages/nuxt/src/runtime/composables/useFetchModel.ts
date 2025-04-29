import type { FetchOptions } from 'ofetch'
import type { ITransformRequestOptions, IContext } from '@vue-api/core'
import { useTransform } from '@vue-api/core'
import type { UseFetchOptions, AsyncData } from 'nuxt/app'
import { useFetch } from '#imports'

type RequestType = "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE"

interface CustomTransformOptions extends FetchOptions {
  transform?: ITransformRequestOptions
  context?: IContext
}

type ExtendedUseFetchOptions<T, R = T> = Omit<UseFetchOptions<T>, 'transform'> & {
  transform?: ITransformRequestOptions | ((response: T) => R)
  context?: IContext
}

function parseUrlAndOptions<T>(
  urlOrOptions?: string | T,
  options?: T,
): [string, T | undefined] {
  if (typeof urlOrOptions === 'string') {
    return [urlOrOptions, options]
  }
  return ['', urlOrOptions]
}

export default function (defaultOptions?: CustomTransformOptions) {
  function createFetchMethod(methodName: RequestType) {
    return async <T, TransformedT = T>(
      urlOrOptions?: string | CustomTransformOptions,
      options?: CustomTransformOptions,
    ): Promise<TransformedT> => {
      const [url, params] = parseUrlAndOptions(urlOrOptions, options)
      const mergedOptions = {
        ...defaultOptions,
        ...params,
        method: methodName,
        context: { ...defaultOptions?.context, ...params?.context },
        transform: { ...defaultOptions?.transform, ...params?.transform },
      }

      const response = await $fetch<T>(url, mergedOptions)

      if (mergedOptions?.transform?.fields) {
        return useTransform(response, mergedOptions.transform.fields, {
          ...mergedOptions,
          context: mergedOptions.context,
        }).value as TransformedT
      }

      return response as unknown as TransformedT
    }
  }

  function createUseFetchMethod(methodName: RequestType) {
    return <T, TransformedT = T, ErrorT = Error>(
      urlOrOptions?: string | ExtendedUseFetchOptions<T, TransformedT>,
      options?: ExtendedUseFetchOptions<T, TransformedT>
    ): AsyncData<TransformedT, ErrorT> => {
      const [url, params] = parseUrlAndOptions(urlOrOptions, options)
      const mergedOptions = {
        ...defaultOptions,
        ...params,
        context: { ...defaultOptions?.context, ...params?.context },
        transform: { ...defaultOptions?.transform, ...params?.transform },
      }

      const transformFn = typeof mergedOptions?.transform === 'function'
        ? mergedOptions.transform
        : (response: T) => {
          if (mergedOptions?.transform?.fields) {
            return useTransform(response, mergedOptions.transform.fields, {
              ...mergedOptions,
              context: mergedOptions.context,
            }).value as TransformedT
          }
          return response as unknown as TransformedT
        }

      return useFetch<T, ErrorT, string, TransformedT>(url || '/', {
        ...mergedOptions,
        method: methodName,
        transform: transformFn,
      })
    }
  }

  return {
    $fetch: {
      get: createFetchMethod('GET'),
      post: createFetchMethod('POST'),
      put: createFetchMethod('PUT'),
      patch: createFetchMethod('PATCH'),
      delete: createFetchMethod('DELETE'),
      head: createFetchMethod('HEAD'),
    },
    useFetch: {
      get: createUseFetchMethod('GET'),
      post: createUseFetchMethod('POST'),
      put: createUseFetchMethod('PUT'),
      patch: createUseFetchMethod('PATCH'),
      delete: createUseFetchMethod('DELETE'),
      head: createUseFetchMethod('HEAD'),
    },
  }
}

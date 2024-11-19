import type { FetchOptions } from 'ofetch'
import type { RouterMethod } from 'h3'
import type { ITransformRequestOptions, IContext } from '@vue-api/core'
import { useTransform } from '@vue-api/core'
import type { UseFetchOptions } from 'nuxt/app'
import { useFetch } from '#imports'

type UppercaseRouterMethod = Uppercase<RouterMethod>

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

// type UseFetchModelReturn = {
//   $fetch: {
//     get: <T, TransformedT = T>(urlOrOptions?: string | CustomTransformOptions, options?: CustomTransformOptions) => Promise<TransformedT>;
//     post: <T, TransformedT = T>(urlOrOptions?: string | CustomTransformOptions, options?: CustomTransformOptions) => Promise<TransformedT>;
//     put: <T, TransformedT = T>(urlOrOptions?: string | CustomTransformOptions, options?: CustomTransformOptions) => Promise<TransformedT>;
//     patch: <T, TransformedT = T>(urlOrOptions?: string | CustomTransformOptions, options?: CustomTransformOptions) => Promise<TransformedT>;
//     delete: <T, TransformedT = T>(urlOrOptions?: string | CustomTransformOptions, options?: CustomTransformOptions) => Promise<TransformedT>;
//     head: <T, TransformedT = T>(urlOrOptions?: string | CustomTransformOptions, options?: CustomTransformOptions) => Promise<TransformedT>;
//   };
//   useFetch: {
//     get: <T, TransformedT = T>(urlOrOptions?: string | ExtendedUseFetchOptions<T>, options?: ExtendedUseFetchOptions<T>) => ReturnType<typeof useFetch<T, Error, string, TransformedT>>;
//     post: <T, TransformedT = T>(urlOrOptions?: string | ExtendedUseFetchOptions<T>, options?: ExtendedUseFetchOptions<T>) => ReturnType<typeof useFetch<T, Error, string, TransformedT>>;
//     put: <T, TransformedT = T>(urlOrOptions?: string | ExtendedUseFetchOptions<T>, options?: ExtendedUseFetchOptions<T>) => ReturnType<typeof useFetch<T, Error, string, TransformedT>>;
//     patch: <T, TransformedT = T>(urlOrOptions?: string | ExtendedUseFetchOptions<T>, options?: ExtendedUseFetchOptions<T>) => ReturnType<typeof useFetch<T, Error, string, TransformedT>>;
//     delete: <T, TransformedT = T>(urlOrOptions?: string | ExtendedUseFetchOptions<T>, options?: ExtendedUseFetchOptions<T>) => ReturnType<typeof useFetch<T, Error, string, TransformedT>>;
//     head: <T, TransformedT = T>(urlOrOptions?: string | ExtendedUseFetchOptions<T>, options?: ExtendedUseFetchOptions<T>) => ReturnType<typeof useFetch<T, Error, string, TransformedT>>;
//   };
// };

export default function (defaultOptions?: CustomTransformOptions) {
  function createFetchMethod(methodName: UppercaseRouterMethod) {
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

  function createUseFetchMethod(methodName: UppercaseRouterMethod) {
    return <T, TransformedT = T>(
      urlOrOptions?: string | ExtendedUseFetchOptions<T>,
      options?: ExtendedUseFetchOptions<T>,
    ) => {
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

          return response
        }

      return useFetch<T, Error, string, TransformedT>(url || '/', {
        method: methodName,
        ...mergedOptions,
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

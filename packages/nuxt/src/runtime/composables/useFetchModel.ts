import type { FetchOptions } from 'ofetch'
import type { IContext, IRequestOptions } from '@vue-api/core'
import { useOfetchModel } from '@vue-api/core'
import { useAsyncData, type AsyncData, type NuxtError } from 'nuxt/app'

type HttpMethod = 'get' | 'patch' | 'post' | 'put' | 'delete' | 'head'

export interface IHttpModel<T> {
  get<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  patch<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  post<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  put<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  delete<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  head<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
}

export default function<M>(options: FetchOptions & {
  context?: IContext
  useAsyncData?: boolean
}): IHttpModel<FetchOptions> {
  const { useAsyncData: useAsyncDataOption = true, ..._options } = options
  const model = useOfetchModel(_options)

  function parseUrlAndOptions<T>(urlOrOptions?: string | IRequestOptions<T>, options?: IRequestOptions<T>): [string, IRequestOptions<T> | undefined] {
    if (typeof urlOrOptions === 'string') {
      return [urlOrOptions, options]
    }
    return ['', urlOrOptions]
  }

  function createMethod<M>(methodName: HttpMethod) {
    return (urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, _options?: IRequestOptions<Omit<FetchOptions, 'body'>>): AsyncData<M, NuxtError> | Promise<M> => {
      const [url, params] = parseUrlAndOptions(urlOrOptions, _options)

      if (!options.useAsyncData === false || useAsyncDataOption === false) return model[methodName]<M>(url, params)
      else return useAsyncData<M, NuxtError>(
        url,
        () => model[methodName]<M>(url, params),
      ) as AsyncData<M, NuxtError>
    }
  }

  return {
    get: createMethod<M>('get'),
    patch: createMethod<M>('patch'),
    post: createMethod<M>('post'),
    put: createMethod<M>('put'),
    delete: createMethod<M>('delete'),
    head: createMethod<M>('head'),
  } as IHttpModel<FetchOptions>
}

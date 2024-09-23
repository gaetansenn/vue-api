import type { FetchOptions } from 'ofetch'
import type { IContext, IRequestOptions } from '@vue-api/core'
import { useOfetchModel } from '@vue-api/core'
import { useAsyncData, type AsyncData, type NuxtError } from 'nuxt/app'

type HttpMethod = 'get' | 'patch' | 'post' | 'put' | 'delete' | 'head'

// Type conditionnel pour le retour de la méthode
type ReturnType<M, UseAsyncData extends boolean> = UseAsyncData extends true ? AsyncData<M, NuxtError> : Promise<M>

export interface IHttpModel<T, UseAsyncData extends boolean> {
  get<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): ReturnType<M, UseAsyncData>
  patch<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): ReturnType<M, UseAsyncData>
  post<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): ReturnType<M, UseAsyncData>
  put<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): ReturnType<M, UseAsyncData>
  delete<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): ReturnType<M, UseAsyncData>
  head<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): ReturnType<M, UseAsyncData>
}

export default function<M, UseAsyncData extends boolean = true>(options: FetchOptions & {
  context?: IContext
  useAsyncData?: UseAsyncData
}): IHttpModel<FetchOptions, UseAsyncData> {
  const { useAsyncData: useAsyncDataOption = true, ..._options } = options
  const model = useOfetchModel(_options)

  type RequestOptions = IRequestOptions<Omit<FetchOptions, 'body'>> & UseAsyncData

  function parseUrlAndOptions<T>(urlOrOptions?: string | IRequestOptions<T>, options?: IRequestOptions<T>): [string, IRequestOptions<T> | undefined] {
    if (typeof urlOrOptions === 'string') {
      return [urlOrOptions, options]
    }
    return ['', urlOrOptions]
  }

  function createMethod<M>(methodName: HttpMethod) {
    return (urlOrOptions?: string | RequestOptions, _options?: RequestOptions): ReturnType<M, UseAsyncData> => {
      const [url, params] = parseUrlAndOptions(urlOrOptions, _options)

      if (params?.useAsyncData === false || useAsyncDataOption === false) {
        return model[methodName]<M>(url, params) as ReturnType<M, UseAsyncData>
      }
      else {
        return useAsyncData<M, NuxtError>(
          url,
          () => model[methodName]<M>(url, params),
        ) as ReturnType<M, UseAsyncData>
      }
    }
  }

  return {
    get: createMethod<M>('get'),
    patch: createMethod<M>('patch'),
    post: createMethod<M>('post'),
    put: createMethod<M>('put'),
    delete: createMethod<M>('delete'),
    head: createMethod<M>('head'),
  } as IHttpModel<FetchOptions, UseAsyncData>
}

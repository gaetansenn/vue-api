import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'
import { IHttpModel, IRequestOptions, handleRequestFunction } from '..'
import { useTransform } from '../../../utils/transform'
import { IContext } from '../../../utils/context'
import { get } from '../../../utils'

export function useOfetchModel(options?: FetchOptions & { context?: IContext }): IHttpModel<FetchOptions> {
  const $fetch = options ? ofetch.create(options) : ofetch

  const handleRequest: handleRequestFunction<FetchOptions, any> = (urlOrOptions, _params?) => {
    let url: string;
    let params: any;

    if (typeof urlOrOptions === 'string') {
      url = urlOrOptions;
      params = _params || {};
    } else {
      url = '';
      params = urlOrOptions || {};
    }

    const context = { ...options?.context || {}, ...params?.context || {} }

    return $fetch(url, {
      ...params?.options,
      method: params?.method
    }).then((response) => {
      if (!params) return response

      const fields = params.transform?.fields

      // Inject scope
      if (params.transform?.scope) response = get(response, params.transform?.scope)

      // Ignore transform if no fields provided
      if (!fields) return response

      // Transform response
      if (Array.isArray(response)) return response.map(item => useTransform(item as any, fields || [], context, params.transform).value)
      else return useTransform(response, fields, context, params.transform).value
    })
  }

  return {
    get(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<FetchOptions, 'body'>>) {
      return handleRequest(urlOrOptions as any, {
        method: 'get',
        ...options,
      });
    },
    patch(urlOrOptions: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<FetchOptions, 'body'>>) {
      return handleRequest(urlOrOptions as any, {
        method: 'patch',
        ...options,
      })
    },
    post(urlOrOptions: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<FetchOptions, 'body'>>) {
      return handleRequest(urlOrOptions as any, {
        method: 'post',
        ...options,
      })
    },
    put(urlOrOptions: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<FetchOptions, 'body'>>) {
      return handleRequest(urlOrOptions as any, {
        method: 'put',
        ...options,
      })
    },
    delete(urlOrOptions: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<FetchOptions, 'body'>>) {
      return handleRequest(urlOrOptions as any, {
        method: 'delete',
        ...options,
      })
    },
    head(urlOrOptions: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<FetchOptions, 'body'>>) {
      return handleRequest(urlOrOptions as any, {
        method: 'head',
        ...options,
      })
    },
  }
}
import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'
import { IHttpModel, handleRequestFunction } from '..'
import get from 'lodash/get'
import { useTransform } from '../../../utils/transform'
import { IContext } from '../../../utils/context'

export function useOfetchModel (options?: FetchOptions & { context?: IContext }): IHttpModel<FetchOptions> {
  const $fetch = options ? ofetch.create(options) : ofetch
  const handleRequest: handleRequestFunction<FetchOptions, any> = (url, params) => {
    const context = { ...options?.context || {}, ...params.context }

    return $fetch(url, {
      ...params?.options,
      method: params?.method
    }).then((response) => {
      if (!params) return response

      const fields = params.transform?.fields

      // Inject scope
      if (params.transform.scope) response = get(response, params.transform?.scope)

      if (Array.isArray(response)) return response.map(item => useTransform(item as any, fields || [], context, params.transform).value)
      else return useTransform(response, fields, context, params.transform).value
    })
  }

  return {
    get(url, options) {
      return handleRequest(url, {
        method: 'get',
        ...options,
      })
    },
    patch (url, options) {
      return handleRequest(url, {
        method: 'patch',
        ...options,
      })
    },
    post (url, options) {
      return handleRequest(url, {
        method: 'post',
        ...options,
      })
    },
    put (url, options) {
      return handleRequest(url, {
        method: 'put',
        ...options,
      })
    },
    delete (url, options) {
      return handleRequest(url, {
        method: 'delete',
        ...options,
      })
    },
    head (url, options) {
      return handleRequest(url, {
        method: 'head',
        ...options,
      })
    },
  }
}
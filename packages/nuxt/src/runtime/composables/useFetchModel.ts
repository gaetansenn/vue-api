import type { FetchOptions } from 'ofetch'
import type { IContext, IRequestOptions } from '@vue-api/core/dist/index.ts'
import { useOfetchModel } from '@vue-api/core'
import { useAsyncData, type AsyncData, type NuxtError } from 'nuxt/app'

export interface IHttpModel<T> {
  get<M>(url?: string, options?: IRequestOptions<Omit<T, "body">>): AsyncData<M, NuxtError>;
  get<M>(options?: IRequestOptions<Omit<T, "body">>): AsyncData<M, NuxtError>;
  patch<M>(url: string, options?: IRequestOptions<Omit<T, "body">>): AsyncData<M, NuxtError>;
  post<M>(url: string, options?: IRequestOptions<Omit<T, "body">>): AsyncData<M, NuxtError>;
  put<M>(url: string, options?: IRequestOptions<Omit<T, "body">>): AsyncData<M, NuxtError>;
  delete<M>(url: string, options?: IRequestOptions<Omit<T, "body">>): AsyncData<M, NuxtError>;
  head<M>(url: string, options?: IRequestOptions<Omit<T, "body">>): AsyncData<M, NuxtError>;
}

export default function (options?: FetchOptions & { context?: IContext }): IHttpModel<FetchOptions> {
  const model = useOfetchModel(options)

  function get<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<FetchOptions, 'body'>>): AsyncData<M, NuxtError> {
    let url: string;
    let params: IRequestOptions<Omit<FetchOptions, 'body'>> | undefined;

    if (typeof urlOrOptions === 'string') {
      url = urlOrOptions;
      params = options;
    } else {
      url = '';
      params = urlOrOptions;
    }

    return useAsyncData<M>(url, () => model.get<M>(url, params)) as AsyncData<M, NuxtError>;
  }

  return {
    get,
    patch: <M>(url: string, params?: IRequestOptions<Omit<FetchOptions, 'body'>>): AsyncData<M, NuxtError> => {
      return useAsyncData<M>(url, () => model.get<M>(url, params)) as AsyncData<M, NuxtError>;
    },
    post: <M>(url: string, params?: IRequestOptions<Omit<FetchOptions, 'body'>>): AsyncData<M, NuxtError> => {
      return useAsyncData<M>(url, () => model.get<M>(url, params)) as AsyncData<M, NuxtError>;
    },
    put: <M>(url: string, params?: IRequestOptions<Omit<FetchOptions, 'body'>>): AsyncData<M, NuxtError> => {
      return useAsyncData<M>(url, () => model.get<M>(url, params)) as AsyncData<M, NuxtError>;
    },
    delete: <M>(url: string, params?: IRequestOptions<Omit<FetchOptions, 'body'>>): AsyncData<M, NuxtError> => {
      return useAsyncData<M>(url, () => model.get<M>(url, params)) as AsyncData<M, NuxtError>;
    },
    head: <M>(url: string, params?: IRequestOptions<Omit<FetchOptions, 'body'>>): AsyncData<M, NuxtError> => {
      return useAsyncData<M>(url, () => model.get<M>(url, params)) as AsyncData<M, NuxtError>;
    },
  };
}
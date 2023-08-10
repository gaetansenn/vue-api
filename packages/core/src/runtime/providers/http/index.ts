import { IContext } from '../../utils/context';
import type { Field, ITransformOptions } from '../../utils/transform'

export interface IHttpModel<T> {
  get<M>(url: string, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
  post<M>(url: string, body?: any, options?: IRequestOptions<T>): Promise<M>;
  put<M>(url: string, body?: any, options?: IRequestOptions<T>): Promise<M>;
  patch<M>(url: string, body?: any, options?: IRequestOptions<T>): Promise<M>;
  delete<M>(url: string, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
  head<M>(url: string, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
}

export type handleRequestFunction<T, M> = (url: string, options?: IRequestOptions<T> & { method: methodType }) => Promise<M>;

export type methodType = 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head'

export interface ITransformRequestOptions extends ITransformOptions {
  fields: (Field | string )[]
}

export interface IRequestOptions<T> {
  transform?: ITransformRequestOptions;
  context?: IContext;
  options?: T
}

export { useOfetchModel } from './ofetch'
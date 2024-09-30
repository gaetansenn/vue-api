import { IContext } from '../../utils/context';
import type { Field, ITransformOptions } from '../../utils/transform'

export interface IHttpModel<T> {
  get<M>(urlOrOptions?: string | IRequestOptions<Omit<T, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
  post<M>(urlOrOptions?: string | IRequestOptions<T>, options?: IRequestOptions<T>): Promise<M>;
  put<M>(urlOrOptions?: string | IRequestOptions<T>, options?: IRequestOptions<T>): Promise<M>;
  patch<M>(urlOrOptions?: string | IRequestOptions<T>, options?: IRequestOptions<T>): Promise<M>;
  delete<M>(urlOrOptions?: string | IRequestOptions<Omit<T, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
  head<M>(urlOrOptions?: string | IRequestOptions<Omit<T, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
}

export type handleRequestFunction<T, M> = (urlOrOptions?: string | IRequestOptions<T>, options?: IRequestOptions<T> & { method: methodType }) => Promise<M>;

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
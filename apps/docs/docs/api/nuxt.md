# Nuxt Module API Reference

## `useFetchModel`

A composable for fetching and managing data models using `ofetch` with Nuxt's `useAsyncData`.

### Usage

```ts
import useFetchModel from '@vue-api/nuxt'

const { get, post, put, patch, delete: del, head } = useFetchModel({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token'
  },
  useAsyncData: false 
})
const { data, error, isLoading } = get('/api/model')
```

### Parameters

- `options: FetchOptions & { context?: IContext, useAsyncData?: boolean }`: Configuration options for the fetch model.

```ts
interface FetchOptions<R extends ResponseType = ResponseType> extends Omit<RequestInit, "body"> {
    baseURL?: string;
    body?: RequestInit["body"] | Record<string, any>;
    ignoreResponseError?: boolean;
    params?: SearchParameters;
    query?: SearchParameters;
    parseResponse?: (responseText: string) => any;
    responseType?: R;
    response?: boolean;
    retry?: number | false;
    onRequest?(context: FetchContext): Promise<void> | void;
    onRequestError?(context: FetchContext & {
        error: Error;
    }): Promise<void> | void;
    onResponse?(context: FetchContext & {
        response: FetchResponse<R>;
    }): Promise<void> | void;
    onResponseError?(context: FetchContext & {
        response: FetchResponse<R>;
    }): Promise<void> | void;
}

interface RequestInit {
    /** A BodyInit object or null to set request's body. */
    body?: BodyInit | null;
    /** A string indicating how the request will interact with the browser's cache to set request's cache. */
    cache?: RequestCache;
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: RequestCredentials;
    /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
    headers?: HeadersInit;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** A boolean to set request's keepalive. */
    keepalive?: boolean;
    /** A string to set request's method. */
    method?: string;
    /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
    mode?: RequestMode;
    priority?: RequestPriority;
    /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: RequestRedirect;
    /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
    referrer?: string;
    /** A referrer policy to set request's referrerPolicy. */
    referrerPolicy?: ReferrerPolicy;
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
    /** Can only be null. Used to disassociate request from any Window. */
    window?: null;
}
```

### `useAsyncData` Option

By default, `useFetchModel` uses Nuxt's `useAsyncData` for server-side rendering and client-side hydration. However, you can disable this behavior for specific requests that don't require server-side rendering or hydration.

- `useAsyncData?: boolean`: (Optional) Controls whether to use `useAsyncData`. Default is `true`.

When set to `false`, the request will be made directly on the client side without SSR hydration. This can be useful for data that doesn't need to be rendered on the server or for requests that should only happen on the client.

### Return Value

- `IHttpModel<FetchOptions>`: An object with methods for different HTTP requests (`get`, `post`, `put`, `patch`, `delete`, `head`).

```ts
export interface IHttpModel<T> {
  get<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  patch<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  post<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  put<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  delete<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
  head<M>(urlOrOptions?: string | IRequestOptions<Omit<FetchOptions, 'body'>>, options?: IRequestOptions<Omit<T, 'body'>>): AsyncData<M, NuxtError> | Promise<M>
}
```
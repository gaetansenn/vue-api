## Structuring API Functions

When creating functions within the `/api` folder, it's important to understand how to use the Vue API module correctly. This guide will walk you through the process of structuring your API functions.

## Choosing a Provider

Vue API works with different providers to handle HTTP requests. Currently, the main provider is the HTTP Ofetch module (https://github.com/unjs/ofetch), which allows for both client-side and server-side requests. In the future, additional providers like Axios or GraphQL may be added.

To use a provider, you need to import the appropriate model. For Ofetch, we use the `useOFetchModel` from `@vue-api/core`.


::: warning
When using the `oftech` provider with Nuxt, there's a special `useFetchModel` composable available. This composable automatically wraps the API calls with `useAsyncData` to handle SSR hydration. For more information on `useAsyncData`, refer to the [Nuxt documentation](https://nuxt.com/docs/api/composables/use-async-data).
:::



## Example: Structuring API Functions

When structuring API functions, we typically return the necessary functions for interacting with the API. In this example, we have `findOne` and `get` methods for retrieving user data.
You have the flexibility to name these methods as you see fit, but the idea is to always use the available methods of $fetch, which correspond to the standard HTTP methods:

::: code-group
```ts [typing.ts]
export interface IHttpModel<T> {
  get<M>(url: string, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
  post<M>(url: string, body?: any, options?: IRequestOptions<T>): Promise<M>;
  put<M>(url: string, body?: any, options?: IRequestOptions<T>): Promise<M>;
  patch<M>(url: string, body?: any, options?: IRequestOptions<T>): Promise<M>;
  delete<M>(url: string, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
  head<M>(url: string, options?: IRequestOptions<Omit<T, 'body'>>): Promise<M>;
}
```
:::

As we can see, we have the basic HTTP methods: get, post, put, patch, delete, and head.
Here's an example of how to structure your API functions:

::: code-group
```ts [api/users/index.ts]
import type { Field, IRequestOptions } from '@vue-api/core'

export interface User {
  id: String;
  name: String;
  to?: String;
}

export default function () {
  const $fetch = useFetchModel({
    baseURL: 'https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users'
  })

  const USER_FIELD = ['id', 'name']
  const router = useRouter()

  const USER_FIELDS: Field[] = [...USER_FIELD, {
    key: 'to',
    mapping: ({ model }: { model: any }) => {
      return router.resolve({ name: 'users'}).href
    }
  }]

  return {
    findOne: async (userId: string, options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<User>(userId, {
        ...options,
        transform: {
          fields: USER_FIELD,
          context: {}
        }
      })
    },
    get: async (options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<User[]>({
        ...options,
        transform: {
          fields: USER_FIELDS,
          context: {}
        }
      })
    },
  }
}
```
:::

::: code-group
```vue [pages/users/index.vue]
<template>
  <div v-if="users.pending.value">Loading ...</div>
  <div v-else>
    <NuxtLink :href="(user.to as string)" v-for="user in users.data.value" :key="(user.id as string)">
      {{ user.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { get } = useApiUsers()

const users = await get()

</script>
```
:::

In this example, which demonstrates a Nuxt 3 application, we define two methods: `findOne` to retrieve a single user by ID, and `get` to retrieve all users. Both methods use the `$fetch.get` function, which corresponds to the HTTP GET method.

The `transform` option in each method allows for field mapping and data transformation. This is where you can specify which fields should be included in the response and how they should be mapped or transformed.

It's worth noting that this example showcases the integration of our structured API functions within a Nuxt 3 context, leveraging its built-in features and conventions.

Next, we can delve into explaining how field mapping and data transformation work in more detail.


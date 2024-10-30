## Structuring API Functions

When creating functions within the `api` folder, it's important to understand how to use the Vue API module correctly. This guide will walk you through the process of structuring your API functions.

## Choosing a Provider

### Vue.js (@vue-api/core)
In Vue.js applications, you can choose different providers to handle HTTP requests. Currently, the main provider is `ofetch`, with plans to support other providers like Axios or GraphQL in the future.

```typescript
// api/users/index.ts
export default function () {
  const $fetch = useOfetchModel({
    baseURL: 'https://api.example.com/users'
  })

  return {
    get: () => $fetch.get('/users')
  }
}
```

### Nuxt (@vue-api/nuxt)
For Nuxt applications, we recommend using the built-in `useFetchModel` composable which provides both `$fetch` and `useFetch` methods:

```typescript
// api/users/index.ts
export default function () {
  const { $fetch, useFetch } = useFetchModel({
    baseURL: 'https://api.example.com/users'
  })

  return {
    // For client-side operations
    create: (userData) => $fetch.post('/users', { body: userData }),
    // For SSR/hydration
    list: () => useFetch.get('/users')
  }
}
```

::: warning
The main difference between Vue and Nuxt implementations is that Nuxt's `useFetchModel` returns an object with both `$fetch` and `useFetch` methods, while Vue's `useOfetchModel` returns `$fetch` directly.
:::

## Example: Basic API Structure
```typescript
// api/users/index.ts
export default function () {
  const { $fetch, useFetch } = useFetchModel({
    baseURL: 'https://api.example.com/users'
  })

  const USER_FIELDS = ['id', 'name', 'email']

  return {
    get: () => useFetch.get({
      transform: {
        fields: USER_FIELDS
      }
    }),
    create: (userData) => $fetch.post({
      body: userData,
      transform: {
        fields: USER_FIELDS
      }
    })
  }
}
```
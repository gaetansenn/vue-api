# Nuxt Module API Reference

## `useFetchModel`

A composable that provides both `$fetch` and Nuxt's `useFetch` with integrated transform capabilities.

### Usage

```typescript
const { $fetch, useFetch } = useFetchModel({
  baseURL: 'https://api.example.com'
})

// Client-side operations with $fetch
const data = await $fetch.get<UserResponse>('/users', {
  transform: {
    fields: ['id', 'name']
  }
})

// SSR/Hydration with useFetch
const { data, pending } = await useFetch.get<UserResponse>('/users', {
  transform: {
    fields: ['id', 'name']
  }
})
```

### When to use which method

As explained in the [Nuxt documentation](https://nuxt.com/docs/getting-started/data-fetching#the-need-for-usefetch-and-useasyncdata):

- Use `$fetch` when:
  - Making client-side only requests
  - Handling form submissions
  - Working in event handlers
  - Making requests in store actions

- Use `useFetch` when:
  - You need SSR support
  - You want automatic data hydration
  - You're fetching data in component setup
  - You want request deduplication

### Available Methods

Both `$fetch` and `useFetch` provide these HTTP methods:
- `get`
- `post`
- `put`
- `patch`
- `delete`
- `head`

### Transform Options

Both methods support the same transform options:

```typescript
interface TransformOptions {
  fields: (Field | string)[]
  scope?: string
  format?: 'camelCase'
  context?: IContext
}
```
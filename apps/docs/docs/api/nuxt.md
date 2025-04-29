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

// Generic types: <ResponseType, TransformedType = ResponseType, ErrorType = Error>
const { data, pending, error } = await useFetch.get<UserResponse, UserTransformed, CustomError>('/users', {
  transform: {
    fields: ['id', 'name']
  }
})
```

### Generic Types for useFetch methods

The `useFetch` methods accept three generic type parameters:
1. `ResponseType`: The type of the raw API response
2. `TransformedType`: The type after transformation (must specify ResponseType again if no transformation needed)
3. `ErrorType`: The type of error that can occur (defaults to Error)

### Type Examples

```typescript
// When no transformation is needed, specify the same type twice
const { data } = await useFetch.get<ApiUser, ApiUser>('/users')

// With transformation
const { data } = await useFetch.get<ApiUser, TransformedUser>('/users', {
  transform: {
    fields: ['id', 'name']
  }
})

// Complete example with error type
const { data, error } = await useFetch.get<ApiUser, ApiUser, CustomError>('/users')

// With transformation and error type
const { data, error } = await useFetch.get<ApiUser, TransformedUser, CustomError>('/users', {
  transform: {
    fields: ['id', 'name']
  }
})
```

Note: When no transformation is needed, you must specify the response type twice in the generic parameters. The first time for `ResponseType` and the second time for `TransformedType`.

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
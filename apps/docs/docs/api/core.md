# Core API Reference

## `useOfetchModel`

A composable for fetching and managing data models using `ofetch`.

### Usage

```typescript
import { useOfetchModel } from '@vue-api/core'

const $fetch = useOfetchModel({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token'
  }
})

// Basic usage
const user = await $fetch.get('/users/1')

// With transform options
const users = await $fetch.get<User[]>('/users', {
  transform: {
    fields: ['id', 'name', 'email']
  }
})
```

### Parameters

#### Options

```typescript
interface FetchOptions {
  baseURL?: string
  headers?: Record<string, string>
  context?: IContext
}
```

- `baseURL`: The base URL for all requests
- `headers`: Default headers to be sent with every request
- `context`: Context object that can be accessed in transform functions

### Transform Options

```typescript
interface TransformOptions {
  fields: (Field | string)[]
  scope?: string
  format?: 'camelCase'
  context?: IContext
}
```

### Available Methods

The `$fetch` instance provides standard HTTP methods:
- `get<T>(url, options?)`
- `post<T>(url, options?)`
- `put<T>(url, options?)`
- `patch<T>(url, options?)`
- `delete<T>(url, options?)`
- `head<T>(url, options?)`

### Example with Advanced Transform

```typescript
const users = await $fetch.get<UserResponse[]>('/users', {
  transform: {
    fields: [
      '*',  // Include all fields
      {
        key: 'fullName',
        mapping: ({ model }) => `${model.firstName} ${model.lastName}`
      },
      {
        key: 'projects.*.status',
        fields: ['id', 'name', 'progress']
      }
    ],
    format: 'camelCase'
  }
})
```

::: tip
For Nuxt applications, consider using `@vue-api/nuxt` which provides additional SSR capabilities through `useFetchModel`.
:::

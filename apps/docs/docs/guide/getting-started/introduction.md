# Introduction

Vue API is a powerful and flexible library designed to streamline API management in Vue 3 and Nuxt 3 applications. It provides an organized approach to handling API calls, making your codebase more maintainable and efficient.

## Key Features

1. **Organized API Management**: Vue API allows you to structure your API calls within directories, promoting clear organization and easy reuse across your application.

2. **Automatic Composable Generation**: Based on your directory structure, Vue API automatically generates composables with intuitive naming conventions, simplifying usage throughout your project.

3. **Advanced Data Mapping**: Transform and optimize API responses to fit your front-end needs using powerful mapping functions, ensuring data consistency and reducing redundant processing.

4. **Framework Agnostic**: While the core functionality is designed to work seamlessly with Vue 3, Vue API also offers additional modules for integration with Nuxt 3, making it versatile for different project setups.

5. **SSR Compatibility**: Vue API is built with server-side rendering in mind, including support for Nuxt 3's useFetch for smooth hydration.

## Implementation Differences

### Vue.js (@vue-api/core)
The core package provides a single fetch instance:

```typescript
import { useOfetchModel } from '@vue-api/core'

const $fetch = useOfetchModel({
  baseURL: 'https://api.example.com'
})
```

### Nuxt (@vue-api/nuxt)
The Nuxt module provides both client-side and SSR-compatible methods:

```typescript
const { $fetch, useFetch } = useFetchModel({
  baseURL: 'https://api.example.com'
})
```

#### Why Two Methods?

As explained in the [Nuxt documentation](https://nuxt.com/docs/getting-started/data-fetching#the-need-for-usefetch-and-useasyncdata):

- Use `$fetch` when:
  - Making client-side only requests (like form submissions)
  - Handling event-based interactions
  - Making requests in store actions or utility functions

- Use `useFetch` when:
  - You need SSR support
  - You want to prevent duplicate requests during hydration
  - You need automatic data hydration between server and client
  - You're fetching data in component setup
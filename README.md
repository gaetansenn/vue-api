# Vue API

This is the official Vue API repository.

## What is Vue API

Vue API is a powerful and flexible library designed to streamline API management in Vue 3 and Nuxt 3 applications. It provides an organized approach to handling API calls, making your codebase more maintainable and efficient.

The core is built on top of the Vue.js framework and is compatible with both Vue 3 and Nuxt 3.

* 📄 [Documentation](https://vue-api.dewib.com)

## Key Features

- **Organized API Management**: Structure your API calls within directories for clear organization and reuse across your application.
- **Automatic Composable Generation**: Generate composables based on your directory structure, with intuitive naming for easy usage across your project.
- **Advanced Data Mapping**: Transform and optimize API responses to fit your front-end needs using powerful mapping functions.
- **Framework Agnostic**: Core functionality works with Vue 3, with additional modules for seamless integration with Vue and Nuxt 3.
- **SSR Compatible**: Designed to work with server-side rendering, including Nuxt 3's useAsyncData for hydration.
- **Flexible Provider Support**: Currently supporting `ofetch`, with plans to expand to `axios`, `GraphQL`, and more in the future.

## What's inside?

This repository uses pnpm as a package manager and turbo as a build system. It includes the following packages/apps:

### Apps and Packages

* `docs`: a VitePress app for documentation
* `nuxt-example`: a Nuxt.js example of usage and installation
* `vue-example`: a Vue.js example of usage and installation
* `@vue-api/core`: the core Vue API library used by all applications
* `@vue-api/vue`: a Vue.js compatible module that bundles the core
* `@vue-api/nuxt`: a Nuxt compatible module that bundles the core

Each package/app is 100% TypeScript.

## Release / Publish

We use [Changesets](https://github.com/changesets/changesets) for managing releases and publishing.

## License

This project is licensed under the MIT License.

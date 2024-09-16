
# Installation

Welcome to **Vue API**! This guide will help you get started by explaining how to install and configure the module in your [Vue 3](#vue-installation) or [Nuxt 3](#nuxt-installation) projects.

## For Nuxt 3 {#nuxt-installation}
The **Vue API** module for Nuxt 3 is available as the `@vue-api/nuxt` package.

### Quick Start
1. Install **@vue-api/nuxt** to your project:

```bash
npx nuxi@latest module add @vue-api/nuxt
```

2. Add `@vue-api/nuxt` to your `nuxt.config` modules

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@vue-api/nuxt']
})
```

### Module Options

You can set the module options by using the `vueAPI` property in `nuxt.config` root.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  vueAPI: {
    rootDir: 'api' // The directory where the API files are located
  }
})
```


That's it! You can now use **Vue API** in your Nuxt 3 project.

## For Vue 3 {#vue-installation}
The **Vue API** module for Vue 3 is available as the `@vue-api/vue` package.

::: code-group

```sh [npm]
$ npm add -D @vue-api/vue
```

```sh [pnpm]
$ pnpm add -D @vue-api/vue
```

```sh [yarn]
$ yarn add -D @vue-api/vue
```

```sh [yarn (pnp)]
$ yarn add -D @vue-api/vue
```

```sh [bun]
$ bun add -D @vue-api/vue
```
:::








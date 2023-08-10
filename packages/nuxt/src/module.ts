import { defineNuxtModule, createResolver, addImportsDir } from '@nuxt/kit'
import { generateComposables } from '@vue-api/core/dist/runtime/utils/export'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule'
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup (options, nuxt) {
    const { resolve } = createResolver(nuxt.options.rootDir)

    generateComposables({ dir: resolve('api') })

    addImportsDir(resolve('api/_composables_'))
  }
})

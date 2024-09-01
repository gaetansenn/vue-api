import { defineNuxtModule, createResolver, addImportsDir } from '@nuxt/kit'
import { generateComposables } from '@vue-api/core/dist/runtime/utils/export'

// Module options TypeScript interface definition
export interface ModuleOptions {
  path: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-api/nuxt',
    configKey: 'vueApiNuxt',
    compatibility: {
      nuxt: '>=3.0.0'
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup (options, nuxt) {
    const { resolve } = createResolver(nuxt.options.rootDir)

    const test = createResolver(import.meta.url)

    addImportsDir(test.resolve('runtime/composables'))

    generateComposables({ dir: resolve('api') })

    addImportsDir(resolve('api/_composables_'))
  }
})

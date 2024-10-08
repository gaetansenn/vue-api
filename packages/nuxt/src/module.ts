import { defineNuxtModule, createResolver, addImportsDir } from '@nuxt/kit'
import { generateComposables } from '@vue-api/core/node'
import { name, version } from '../package.json'

// Module options TypeScript interface definition
export interface ModuleOptions {
  rootPath: string
  ignorePatterns: string[]
  ignorePrefixes: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'vueApi',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    rootPath: 'api',
    ignorePatterns: [],
    ignorePrefixes: ['_'],
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Generate composables on build
    nuxt.hook('ready', async () => {
      const rootDir = nuxt.options.srcDir
      const rootDirectoryPath = resolve(rootDir, options.rootPath)

      await generateComposables({
        dir: rootDirectoryPath,
        ignorePatterns: options.ignorePatterns,
        ignorePrefixes: options.ignorePrefixes,
      })
    })

    // Add composables directory to auto-imports
    addImportsDir(resolve(nuxt.options.srcDir, options.rootPath, '_composables_'))
    // Add useFetchModel composable
    addImportsDir(resolve(__dirname, 'runtime/composables'))

    // Transpile @vue-api/core
    nuxt.options.build.transpile.push('@vue-api/core')

    // Add types
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ types: '@vue-api/core' })
    })
  },
})

import { defineNuxtModule, createResolver } from '@nuxt/kit'
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
    nuxt.hook('build:before', async () => {
      const rootDir = nuxt.options.srcDir
      const rootDirectoryPath = resolve(rootDir, options.rootPath)

      await generateComposables({
        dir: rootDirectoryPath,
        ignorePatterns: options.ignorePatterns,
        ignorePrefixes: options.ignorePrefixes,
      })
    })

    // Add composables directory to auto-imports
    nuxt.options.imports = nuxt.options.imports || {}
    nuxt.options.imports.dirs = nuxt.options.imports.dirs || []
    nuxt.options.imports.dirs.push(resolve(nuxt.options.srcDir, options.rootPath, '_composables_'))

    // Add types
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ types: '@vue-api/core' })
    })
  },
})

import { defineNuxtModule, createResolver, addImportsDir, resolvePath } from '@nuxt/kit'
import { generateComposables } from '@vue-api/core/node'
import { name, version } from '../package.json'

// Module options TypeScript interface definition
export interface ModuleOptions {
  rootPath: string
  ignorePatterns: string[]
  ignorePrefixes: string[]
}

export type {
  Field,
  ITransformOptions,
  IRequestOptions,
  ITransformRequestOptions,
  IContext,
} from '@vue-api/core'


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
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Create resolver to resolve dist paths within @vunix/core
    const core = createResolver(await resolvePath('@vue-api/core', { cwd: import.meta.url }))

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
    const coreRootPath = core.resolve('..') // root dist directory
    nuxt.options.build.transpile.push(coreRootPath)
    nuxt.options.alias['@vue-api/core'] = coreRootPath

    // Add types
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ types: '@vue-api/core' })
    })
  },
})

import path from 'node:path'
import type { Plugin } from 'vite'
import { generateComposables } from '@vue-api/core/node'
import AutoImport from 'unplugin-auto-import/vite'

export default async function vueApiPlugin(apiPath: string = 'api'): Promise<Plugin> {
  return {
    name: 'vue-api-plugin',
    enforce: 'pre',
    ...AutoImport({
      dirs: [
        `${apiPath}/_composables_`,
      ],
      imports: [
        {
          '@vue-api/core': [
            'useOfetchModel',
            'useTransform'
          ],
        },
        {
          from: '@vue-api/core',
          imports: ['FetchOptions', 'IHttpModel', 'IRequestOptions', 'Field']
        }
      ]
    }),
    async config(config) {
      const rootDir = config.root || process.cwd();
      const apiDirectoryPath = path.resolve(rootDir, apiPath);

      // Génération des composables
      await generateComposables({ dir: apiDirectoryPath });
    }
  };
}
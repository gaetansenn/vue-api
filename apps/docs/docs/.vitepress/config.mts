import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue API",
  description: "Organized API management for Vue 3 and Nuxt 3",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/basic-usage' },
    ],
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: 'Getting Started',
            base: '/guide/getting-started/',
            items: [
              { text: 'Introduction', link: 'introduction' },
              { text: 'Installation', link: 'installation' },
            ],
            // collapsed: true
          },
          {
            text: 'Composables',
            base: '/guide/composables/',
            items: [
              { text: 'Introduction', link: 'introduction' },
              { text: 'Structuring API Functions', link: 'structuring-api-functions' },
              { text: 'Mapping data', link: 'mapping'}
            ],
            // collapsed: true
          }
        ]
      },
      // '/guide/': [
      //   {
      //     text: 'Guide',
      //     items: [
      //       { text: 'Getting Started', link: '/guide/getting-started' },
      //       { text: 'Configuration', link: '/guide/configuration' },
      //       { text: 'API Management', link: '/guide/api-management' },
      //       { text: 'Composables', link: '/guide/composables' },
      //       { text: 'Data Mapping', link: '/guide/data-mapping' },
      //     ]
      //   }
      // ],
      // '/api/': [
      //   {
      //     text: 'API Reference',
      //     items: [
      //       { text: 'Core', link: '/api/core' },
      //       { text: 'Vue', link: '/api/vue' },
      //       { text: 'Nuxt', link: '/api/nuxt' },
      //     ]
      //   }
      // ],
      // '/examples/': [
      //   {
      //     text: 'Examples',
      //     items: [
      //       { text: 'Basic Usage', link: '/examples/basic-usage' },
      //       { text: 'Advanced Mapping', link: '/examples/advanced-mapping' },
      //       { text: 'SSR Integration', link: '/examples/ssr-integration' },
      //     ]
      //   }
      // ]
    }
  }
})

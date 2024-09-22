import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue API",
  description: "Organized API management for Vue 3 and Nuxt 3",
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/gaetansenn/vue-api' },
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started/installation', activeMatch: '/guide/' },
      { text: 'API', items: [
        {
          text: 'Core',
          link: '/api/core',
        },
        {
          text: 'Nuxt',
          link: '/api/nuxt'
        },
      ], },
      { text: 'Playground', link: '/examples' },
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
      }
    }
  }
})

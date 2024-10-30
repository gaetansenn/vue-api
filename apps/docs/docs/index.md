---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Vue API
  text: A powerful and flexible library for managing API calls
  tagline: Streamline your API management in Vue 3 / Nuxt 3
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started/installation
    - theme: alt
      text: API Examples
      link: /examples

features:
  - title: Organized API Management
    details: Structure your API calls within directories for clear organization and reuse across your application.
  
  - title: Automatic Composable Generation
    details: Generate composables based on your directory structure, with intuitive naming for easy usage across your project.
  
  - title: Advanced Data Mapping
    details: Transform and optimize API responses to fit your front-end needs using powerful mapping functions.
  
  - title: Framework Agnostic
    details: Core functionality works with Vue 3, with additional modules for seamless integration with Vue and Nuxt 3.
  
  - title: SSR Compatible
    details: Designed to work with server-side rendering, including Nuxt 3's useFetch for hydration.
  
  - title: Flexible Provider Support
    details: Currently supporting `ofetch`, with plans to expand to `axios`, `GraphQL`, and more in the future.
---

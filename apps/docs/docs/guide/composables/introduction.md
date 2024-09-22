# How to use composables

Vue API automatically generates composables based on your API directory structure. This feature simplifies the process of making API calls in your Vue or Nuxt application by creating intuitive, easy-to-use composables that mirror your API structure.

## Automatic Composable Generation

The library scans your API directory and creates composables for each endpoint defined. The naming convention for these composables is based on the directory structure and file names within your API folder.

### Naming Convention

The general format for generated composable names is:

`useApi[Folder1][Folder2]...[FileName]()`

Here are some examples to illustrate this convention:

1. For a file `api/cms/article.ts`:
   The generated composable name would be `useApiCmsArticle`

2. For a file `api/cms/index.ts`:
   The generated composable name would be `useApiCmsIndex`

3. In the case where there's only an `index.ts` file in a folder:
   For `api/cms/blogs/index.ts`, the generated composable name would be `useApiCms`

This convention works recursively, so there's no limit to the depth of the folder structure.

## Generating the Composables Declaration File

A CLI tool `vue-api` is provided by the `@vue-api/core` package to generate the composables declaration file. The `generateComposables` function is used to generate the composables declaration file. Here's what the tool does:

1. Creates a `_composables_` folder in the root directory (default `api`).
2. Generates an `index.ts` file in this folder, which exports all the composables.

This `index.ts` file is then injected into the project:
- In Nuxt, via the Nuxt module `addImportsDir`
- In Vue, via the Vue Vite plugin using the `unplugin-auto-import/vite` module to inject the composables in the project.

This allows for a centralized declaration of all generated composables, making it easier to import and use them in your application.


## Using Generated Composables

Now that you understand how composables are automatically generated based on your API structure, let's explore how to effectively use these composables in your Vue or Nuxt application. The next section will guide you through the process of structuring your API functions to work seamlessly with these generated composables.







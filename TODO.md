# TODO

## High Priority
- [ ] Omit value when parent has * but field has newKey we should omit the newKey
- [ ] Fix bug of key * with omit with parent path ?
```ts
const model = {
    data: {
      facets: [
        {
          id: 11,
          __component: "algolia.facet-checkbox-group",
          key: "pays",
          label: "Pays",
          searchable: true,
          theme: "default",
          searchPlaceholder: "Je recherche un pays...",
          seeMore: "J'affiche les {0} pays",
          cols: null,
          displayCustomOptionsOnly: false,
          seeLess: "J'affiche moins de pays",
        },
      ],
    },
  };
fields: [{
        key: 'facets',
        path: 'data.facets',
        fields: [
          { key: '*', omit: ['__component'] },
          {
            key: 'component',
            mapping: ({ model }) => {
              switch (model.__component) {
                case 'algolia.facet-checkbox-group':
                  return resolveComponent('AlgoliaFacetCheckBoxGroup')
              }
            }
          }
        ]
      }]
```
- [ ] Fix bug omit with path
```ts
fields: [{
        key: 'facets',
        path: 'data.facets',
        omit: ['id']
      }]
```

- [ ] Improve `parentModel` handling in `extractModel` function for nested fields and wildcards
  - Update logic to correctly pass `parentModel` through nested levels
  - Ensure `parentModel` is correctly set for wildcard expansions
- [ ] Implement comprehensive test suite for @vue-api/core
  - Focus on testing the mapping functionality
  - Cover basic, nested, and wildcard mapping scenarios
  - Ensure edge cases are properly handled
- [ ] Implement clean-up functionality for inconsistent data structures
  - Add option to handle cases where mapped items have different structures
  - Implement logic to skip or provide default values for missing fields
  - Consider adding a configuration option to control this behavior

## Medium Priority
- [ ] Update `expandWildcardFields` to properly manage `parentModel` for wildcard expansions
  - Implement logic to set `parentModel` for each expanded field
- [ ] Expand test coverage for other core functionalities
  - Test utility functions (get, set, camelCase, etc.)
  - Test error handling and edge cases
- [ ] Design and implement configuration options for clean-up behavior
  - Add ability to specify default values for missing fields
  - Implement option to skip fields entirely if not present in the source data

## Low Priority
- [ ] Test and verify `parentModel` behavior in complex nested scenarios
  - Create comprehensive test suite for various nested and wildcard scenarios
  - Document edge cases and expected behavior
- [ ] Set up continuous integration for automated testing
  - Integrate with GitHub Actions or similar CI tool
  - Ensure tests run on each pull request
- [ ] Document new clean-up functionality and configuration options
  - Update user guide with examples of handling inconsistent data structures
  - Provide best practices for using the clean-up feature


## Completed
- [x] Implement initial version of `extractModel` function
- [x] Create basic wildcard expansion functionality

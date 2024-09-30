# TODO

## High Priority
- [ ] Improve `parentModel` handling in `extractModel` function for nested fields and wildcards
  - Update logic to correctly pass `parentModel` through nested levels
  - Ensure `parentModel` is correctly set for wildcard expansions
- [ ] Implement comprehensive test suite for @vue-api/core
  - Focus on testing the mapping functionality
  - Cover basic, nested, and wildcard mapping scenarios
  - Ensure edge cases are properly handled

## Medium Priority
- [ ] Update `expandWildcardFields` to properly manage `parentModel` for wildcard expansions
  - Implement logic to set `parentModel` for each expanded field
- [ ] Expand test coverage for other core functionalities
  - Test utility functions (get, set, camelCase, etc.)
  - Test error handling and edge cases

## Low Priority
- [ ] Test and verify `parentModel` behavior in complex nested scenarios
  - Create comprehensive test suite for various nested and wildcard scenarios
  - Document edge cases and expected behavior
- [ ] Set up continuous integration for automated testing
  - Integrate with GitHub Actions or similar CI tool
  - Ensure tests run on each pull request

## Completed
- [x] Implement initial version of `extractModel` function
- [x] Create basic wildcard expansion functionality

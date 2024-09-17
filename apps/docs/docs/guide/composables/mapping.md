# Mapping System

The mapping system is a powerful feature that allows you to transform data structures according to defined rules. It's particularly useful for adapting complex data structures or normalizing data from various sources.

## Key Concepts

### Field

A `Field` can be either a simple string or a `FieldObject` with the following properties:

- `key`: The original key to read from the source object.
- `newKey`: The new key if you need to change the original one.
- `fields`: An array of `FieldObject` or a function returning such an array, for recursive mapping.
- `mapping`: A custom transformation function.
- `filter`: A function to filter array elements.
- `default`: A default value or function to use when the source value is empty.
- `merge`: A boolean indicating whether to merge the result into the parent object.

### MappingFunction

A function that takes an object with `model`, `key`, `newModel`, `parentModel`, `originModel`, and `context` properties, and returns a transformed value.

### FilterFunction

A function that takes a model and returns a boolean, used to filter array elements.

## Usage

The main function for using the mapping system is `useTransform`:

```ts
const { value, getEmpty } = useTransform(model, fields, context, options)
```

### Parameters

- `model`: The source data to transform.
- `fields`: An array of `Field` objects or a function returning such an array.
- `context`: An optional context object.
- `options`: Additional options including `scope` and `format`.

### Return Value

- `value`: The transformed model.
- `getEmpty`: A function that returns an empty model based on the provided fields.

## Transformation Process

1. The system iterates through each field in the `fields` array.
2. For each field, it applies the following rules:
   - If a `mapping` function is provided, it's called to transform the value.
   - If `fields` are specified, it recursively applies the transformation.
   - If a `filter` is provided for array fields, it's applied to each element.
   - The `default` value is used when the source value is empty or null.
   - Key formatting (e.g., camelCase) is applied if specified in the options.
3. The transformed values are assembled into a new object, which is returned.

## Advanced Features

- **Recursive mapping**: Allows for deep transformation of nested objects.
- **Array handling**: Can map and filter elements of array fields.
- **Context injection**: Provides additional data to mapping and default value functions.
- **Flexible key renaming**: Supports renaming keys during the transformation process.

## Examples

Here are some examples to illustrate how to use the mapping system:

### Basic Mapping

```ts
const model = { firstName: 'John', lastName: 'Doe', age: 30 }
const fields = ['firstName', 'lastName', { key: 'age', newKey: 'yearOfBirth', mapping: ({ model }) => new Date().getFullYear() - model.age }]
const { value } = useTransform(model, fields)
console.log(value) // { firstName: 'John', lastName: 'Doe', yearOfBirth: 1993 }
```

### Nest Mapping

```ts
const model = {
user: { name: 'John Doe', email: 'john@example.com' },
orders: [{ id: 1, total: 100 }, { id: 2, total: 200 }]
}
const fields = [
{ key: 'user', fields: ['name', 'email'] },
{ key: 'orders', fields: ['id', { key: 'total', mapping: ({ model }) => $${model.total} }] }
]
const { value } = useTransform(model, fields)
console.log(value)
// {
// user: { name: 'John Doe', email: 'john@example.com' },
// orders: [{ id: 1, total: '$100' }, { id: 2, total: '$200' }]
// }
```

## Advanced Examples

### Using Filters and Default Values

```ts
const model = {
  users: [
    { name: 'John', age: 30, active: true },
    { name: 'Jane', age: 25, active: false },
    { name: 'Bob', age: 40, active: true }
  ]
}

const fields = [
  { 
    key: 'users', 
    fields: [
      'name',
      { key: 'age', default: 18 },
      { key: 'status', mapping: ({ model }) => model.active ? 'Active' : 'Inactive' }
    ],
    filter: (user) => user.active
  }
]

const { value } = useTransform(model, fields)
console.log(value)
// {
//   users: [
//     { name: 'John', age: 30, status: 'Active' },
//     { name: 'Bob', age: 40, status: 'Active' }
//   ]
// }
```

### Using Context

```ts
const model = { price: 100 }
const context = { taxRate: 0.2 }

const fields = [
  { 
    key: 'price', 
    newKey: 'totalPrice',
    mapping: ({ model, context }) => model.price * (1 + context.taxRate)
  }
]

const { value } = useTransform(model, fields, context)
console.log(value) // { totalPrice: 120 }
```

## Best Practices

- Use descriptive field names to improve readability.
- Prefer simple and composable transformations over complex mappings.
- Use context to inject dependencies or global configurations.
- Consider performance when transforming large data structures.
- Test your mappings with various input scenarios, including edge cases.

## Error Handling

The mapping system handles errors silently by default. For more robust error handling:

- Use default values to handle missing fields.
- Implement checks in your mapping functions.
- Consider using an external validation system for complex structures.
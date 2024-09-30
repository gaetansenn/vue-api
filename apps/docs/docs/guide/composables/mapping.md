# Mapping System

The mapping system is a powerful feature that allows you to transform data structures according to defined rules. It's particularly useful for adapting complex data structures or normalizing data from various sources.

## Key Concepts

### Field

```ts
export type Field = FieldObject | string
```

A `Field` can be either a simple string or a `FieldObject`

### FieldObject

```ts
export interface FieldObject {
  key: string;
  newKey?: string;
  fields?: Field[];
  mapping?: MappingFunction;
  filter?: FilterFunction;
  default?: any;
  merge?: boolean;
  scope?: string;
}
```

- `key`: The original key to read from the source object.
- `newKey`: The new key if you need to change the original one.
- `fields`: An array of `Field` for recursive mapping of nested objects or arrays.
- `mapping`: A custom transformation function.
- `filter`: A function to filter array elements.
- `default`: A default value or function to use when the source value is empty.
- `merge`: A boolean indicating whether to merge the result into the parent object.
- `scope`: Specifies a different part of the model to use for this specific field's mapping.


### MappingFunction

```ts
export type MappingFunction = (args: {
  model: any,
  key: string,
  newModel?: any,
  parentModel?: any,
  originModel?: any,
  context?: IContext
}) => any;
```

- `model: any`: The current value of the field being transformed.
- `key: string`: The key (or name) of the field being transformed.
- `newModel?: any`: The new model being constructed during the transformation.
- `parentModel?: any`
   - The parent model of the object being transformed.
   - Useful for accessing higher-level data when transforming nested structures.
- `originModel?: any`: The complete original model, before any transformation.
- `context?: IContext`: Allows injection of additional data or functions into the transformation process.

The MappingFunction uses this information to perform a custom transformation and returns the new transformed value.

Example:

```ts
const model = {
  user: {
    name: 'John Doe',
    age: 30
  },
  orders: [
    { id: 1, total: 100 },
    { id: 2, total: 200 }
  ]
};

const fields = [
  {
    key: 'user',
    fields: [
      'name',
      {
        key: 'age',
        mapping: ({ model, parentModel, originModel, context }) => {
          const currentYear = context.currentYear;
          const birthYear = currentYear - model;
          const orderCount = originModel.orders.length;
          return `${parentModel.name} was born in ${birthYear} and has ${orderCount} orders.`;
        }
      }
    ]
  }
];

const context = { currentYear: 2023 };

const { value } = useTransform(model, fields, context);
```

**Output**
```json
{
  "user": {
  "name": "John Doe",
  "age": "John Doe was born in 1993 and has 2 orders."
  }
}
```

In this example, the mapping function uses several properties to create a custom string:
- `model` to access the current age
- `parentModel` to access the user's name
- `originModel` to count the total number of orders
- `context` to get the current year

This approach allows for very flexible and powerful transformations, giving access to different levels of data in the mapping process.

### FilterFunction

```ts
export type FilterFunction = (m: any) => boolean;
```

A function that takes a model and returns a boolean, used to filter array elements.

**Example:**

```ts
const model = {
  items: [
    { id: 1, name: 'Apple', category: 'Fruit' },
    { id: 2, name: 'Carrot', category: 'Vegetable' },
    { id: 3, name: 'Banana', category: 'Fruit' },
    { id: 4, name: 'Broccoli', category: 'Vegetable' }
  ]
};

const fields = [
  {
    key: 'items',
    fields: ['id', 'name'],
    filter: (item) => item.category === 'Fruit'
  }
];

const { value } = useTransform(model, fields);
```

**Output:**

```json
{
  "items": [
    { "id": 1, "name": "Apple" },
    { "id": 3, "name": "Banana" }
  ]
}
```

In this example, the FilterFunction `(item) => item.category === 'Fruit'` is used to keep only the items with the category 'Fruit'. The resulting transformed object contains only the filtered items, with their `id` and `name` fields preserved as specified in the `fields` array.

## Usage

The main function for using the mapping system is `useTransform`:

```ts
const { value, getEmpty } = useTransform<T>(model: MaybeRef<T>, fields: Field[], options?: ITransformOptions)
```

### Parameters

- `model`: The source data to transform.
- `fields`: An array of [`Field`](#field) objects
- `options`: [`ITransformOptions`](#itransformoptions).

### Return Value

- `value`: The transformed model.
- `getEmpty`: A function that returns an empty model based on the provided fields.

## ITransformOptions

An interface that defines additional options for the transformation process.

```ts
export interface ITransformOptions {
  scope?: string;
  format?: TransformFormat;
  context: IContext;
}
````

#### Properties

- `scope`: Defines a specific scope for the transformation. This can be used to limit the transformation to a particular part of the model.
- `format`: Specifies the format to be applied to the keys in the transformed object. This could be used for tasks like converting keys to camelCase or snake_case.
- `context`: Provides additional context data that can be used within mapping functions.

#### Example

````ts
const model = {
  user: {
    user_name: 'John Doe',
    user_age: 30,
    user_role: 'developer'
  },
  company: {
    company_name: 'Acme Inc'
  }
};

const fields = [
  'user_name', 
  'user_age',
  {
    key: 'user_role',
    mapping: ({ model, context }) => `${context.rolePrefix}${model}`
  }
];

const options: ITransformOptions = {
  scope: 'user',
  format: 'camelCase',
  context: { 
    rolePrefix: 'ROLE_'
  }
};

const { value } = useTransform(model, fields, options);
````

**Output**:

```json
{
  "userName": "John Doe",
  "userAge": 30,
  "userRole": "ROLE_developer"
}
```

In this example:
- The `scope` option is set to 'user', limiting the transformation to the 'user' object within the model.
- The `format` option converts the keys to camelCase.
- The `context` could be used in custom mapping functions if needed.
- Note that the 'company' object is not included in the output due to the specified scope.

## Wildcard Mapping

Wildcard mapping allows you to include and transform all fields at a certain level of your object structure or even deeper nested levels. The `expandWildcardFields` function handles the expansion of wildcards in both keys and scopes.

### Nested Wildcard with Scope

You can use wildcards in the `key` property to handle complex nested structures. The `scope` is automatically inherited from the parent field unless explicitly specified:

```ts
const model = {
  company: {
    departments: {
      engineering: { employees: 50, budget: { allocated: 1000000 } },
      marketing: { employees: 30, budget: { allocated: 500000 } }
    }
  }
};

const fields = [
  'company.name',
  {
    key: 'company.departments.*',
    fields: [
      'employees',
      {
        key: 'budget.allocated',
        mapping: ({ model }) => `$${model.budget.allocated / 1000000}M`
      }
    ]
  }
];

const { value } = useTransform(model, fields);
```

In this example:
1. The wildcard in `company.departments.*` expands to include all departments.
2. The `scope` for the nested fields (like `budget.allocated`) is automatically set to `company.departments.*`, inheriting from the parent field.
3. The mapping function for `budget.allocated` receives the entire department object as its `model`, so we need to access `model.budget.allocated`.
4. This approach allows for consistent transformations across multiple nested objects while maintaining the correct scope for each transformation.

Note: You can still explicitly set a `scope` for any field if you need to override the inherited scope. For example:

```ts
{
  key: 'budget.allocated',
  scope: 'company.departments.*.budget',
  mapping: ({ model }) => `$${model.allocated / 1000000}M`
}
```

This would set the scope specifically to the budget object, allowing direct access to `allocated`.

## Scope

The `scope` property in a `FieldObject` allows you to specify a different part of the model to use for this specific field's mapping. This is particularly useful when working with nested structures and wildcards.

### Example of using scope

```ts
const model = {
  company: {
    departments: {
      engineering: { employees: 50, budget: { allocated: 1000000 } },
      marketing: { employees: 30, budget: { allocated: 500000 } }
    }
  }
};

const fields = [
  'company.name',
  {
    key: 'company.departments.*',
    fields: [
      'employees',
      {
        key: 'budget.allocated',
        scope: 'company.departments.*',
        mapping: ({ model }) => `$${model.allocated / 1000000}M`
      }
    ]
  }
];

const { value } = useTransform(model, fields);
```

In this example, the `scope` property in the `budget.allocated` field ensures that the `model` passed to the mapping function is the specific department object, allowing direct access to the `allocated` property.

## Examples

Here are some examples to illustrate different use cases of the mapping system:

### Basic Mapping with Wildcards and Specific Transformations

```ts
const model = {
  user: {
    personalInfo: { name: 'John Doe', age: 30, email: 'john@example.com' },
    preferences: { theme: 'dark', notifications: true }
  },
  posts: [
    { id: 1, title: 'Hello World', views: 100, createdAt: '2023-01-01T00:00:00Z' },
    { id: 2, title: 'Mapping is Fun', views: 150, createdAt: '2023-01-15T00:00:00Z' }
  ]
}

const fields = [
  'user.personalInfo.*',
  'user.preferences.theme',
  {
    key: 'posts',
    fields: [
      '*',
      {
        key: 'views',
        mapping: ({ model }) => `${model} views`
      },
      {
        key: 'createdAt',
        mapping: ({ model }) => new Date(model).toLocaleDateString()
      }
    ]
  }
]

const { value } = useTransform(model, fields)
```

Output:
```json
{
  "user": {
    "personalInfo": {
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com"
    },
    "preferences": {
      "theme": "dark"
    }
  },
  "posts": [
    {
      "id": 1,
      "title": "Hello World",
      "views": "100 views",
      "createdAt": "1/1/2023"
    },
    {
      "id": 2,
      "title": "Mapping is Fun",
      "views": "150 views",
      "createdAt": "1/15/2023"
    }
  ]
}
```

This example demonstrates:
- Using wildcards to include all fields in `personalInfo`
- Selecting specific fields from nested objects (`preferences.theme`)
- Applying transformations to specific fields within an array of objects (`posts`)

### Advanced Mapping with Context and Filters

```ts
const model = {
  products: [
    { id: 1, name: 'Laptop', price: 1000, inStock: true },
    { id: 2, name: 'Phone', price: 500, inStock: false },
    { id: 3, name: 'Tablet', price: 300, inStock: true }
  ]
}

const context = {
  currency: 'USD',
  exchangeRate: 0.85, // USD to EUR
  formatCurrency: (amount, currency) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }
}

const fields = [
  {
    key: 'products',
    fields: [
      'id',
      'name',
      {
        key: 'price',
        mapping: ({ model, context }) => {
          const priceInEUR = model * context.exchangeRate
          return {
            USD: context.formatCurrency(model, 'USD'),
            EUR: context.formatCurrency(priceInEUR, 'EUR')
          }
        }
      },
      {
        key: 'status',
        mapping: ({ model }) => model.inStock ? 'Available' : 'Out of Stock'
      }
    ],
    filter: (product) => product.inStock
  }
]

const { value } = useTransform(model, fields, context)
```

Output:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "price": {
        "USD": "$1,000.00",
        "EUR": "€850.00"
      },
      "status": "Available"
    },
    {
      "id": 3,
      "name": "Tablet",
      "price": {
        "USD": "$300.00",
        "EUR": "€255.00"
      },
      "status": "Available"
    }
  ]
}
```

This advanced example showcases:
- Using context to provide global data and functions
- Complex field transformations (currency conversion and formatting)
- Filtering array elements based on a condition
- Creating new fields based on existing data (`status`)

These examples demonstrate the flexibility and power of the mapping system, allowing for complex data transformations with relatively simple configuration.

## Transformation Process

1. The system first processes any wildcard fields in the `fields` array.
   - Wildcard fields (e.g., `*` or `level.*`) are identified and applied to the corresponding levels of the source object.
   - This creates a base transformed object that includes all wildcard-matched properties.

2. The system then iterates through each non-wildcard field in the `fields` array.

3. For each field, it applies the following rules:
   - If a `mapping` function is provided, it's called to transform the value.
   - If `fields` are specified for an object or array, it recursively applies the transformation.
   - If a `filter` is provided for array fields, it's applied to each element.
   - The `default` value is used when the source value is empty or null.
   - If a `newKey` is specified, the transformed value is assigned to this new key.

4. Key formatting (e.g., camelCase) is applied if specified in the options.

5. The transformed values are assembled into the final object, potentially overwriting or adding to the wildcard-matched properties.

6. The resulting transformed object is returned.

This process ensures that wildcard mappings are applied first as a base, and then specific field transformations can override or add to this base. This allows for both broad inclusion of properties and specific customization where needed.

## Advanced Features

- **Recursive mapping**: Allows for deep transformation of nested objects.
- **Array handling**: Can map and filter elements of array fields.
- **Context injection**: Provides additional data to mapping and default value functions.
- **Flexible key renaming**: Supports renaming keys during the transformation process.
- **Wildcard mapping**: Enables mapping of all fields at a certain level or deeper nested levels.

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
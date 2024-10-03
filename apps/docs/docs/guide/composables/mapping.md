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
  path?: string;
  fields?: Field[];
  mapping?: MappingFunction;
  filter?: FilterFunction;
  default?: any;
  merge?: boolean;
  scope?: string;
  omit?: string[];
}
```

- `key`: The original key to read from the source object.
- `newKey`: The new key if you need to change the original one.
- `path`: A custom path to retrieve the value from the source object, allowing for more flexible data access.
- `fields`: An array of `Field` for recursive mapping of nested objects or arrays.
- `mapping`: A custom transformation function.
- `filter`: A function to filter array elements.
- `default`: A default value or function to use when the source value is empty.
- `merge`: A boolean indicating whether to merge the result into the parent object.
- `scope`: Specifies a different part of the model to use for this specific field's mapping.
- `omit`: An array of fields to exclude from the transformation process.


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

The `scope` property in a `FieldObject` allows you to specify which part of the model to use for this specific field's mapping. By default, the scope is set to the current value of the `key` property. This means that when mapping nested objects, the scope automatically adjusts to the current level of nesting.

However, there may be cases where you want to access data from a different part of the model. This is where explicitly setting the `scope` property becomes useful.

### Example of default scope behavior and custom scope

```ts
const model = {
  user: {
    name: 'John Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Anytown'
    }
  },
  company: {
    name: 'Acme Inc',
    employees: 100
  }
};

const fields = [
  {
    key: 'user',
    fields: [
      'name',
      'age',
      {
        key: 'location',
        mapping: ({ model }) => `${model.address.city}, ${model.address.street}`
      },
      {
        key: 'companyInfo',
        scope: 'company',
        mapping: ({ model }) => `Works at ${model.name} with ${model.employees} colleagues`
      }
    ]
  }
];

const { value } = useTransform(model, fields);
```

Output:
```json
{
  "user": {
    "name": "John Doe",
    "age": 30,
    "location": "Anytown, 123 Main St",
    "companyInfo": "Works at Acme Inc with 100 colleagues"
  }
}
```

In this example:
1. The `location` field doesn't specify a `scope`, so it uses the default scope (which is `user`). This allows it to access `model.address` directly.
2. The `companyInfo` field sets its `scope` to `company`. This changes the context of the `model` parameter in its mapping function, allowing it to access company data even though it's being mapped within the `user` object.

This approach demonstrates how `scope` can be used to access different parts of the model, regardless of where the field is positioned in the mapping structure. It's particularly useful for creating derived fields that combine data from various parts of your model.

## Path

The `path` property in a `FieldObject` allows you to specify a custom path to retrieve the value from the source object. This is particularly useful when you need to access deeply nested properties or when the structure of your source object doesn't match your desired output structure.

### Example of using path

```ts
const model = {
  user: {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe'
      },
      contact: {
        email: 'john.doe@example.com'
      }
    }
  }
};

const fields = [
  {
    key: 'fullName',
    path: 'user.personalInfo.name',
    mapping: ({ model }) => `${model.first} ${model.last}`
  },
  {
    key: 'email',
    path: 'user.personalInfo.contact.email'
  }
];

const { value } = useTransform(model, fields);
```

Output:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com"
}
```

In this example:
- The `path` property is used to directly access nested properties in the source object.
- For `fullName`, we use both `path` and `mapping` to create a custom output.
- For `email`, we use `path` to directly retrieve the deeply nested email value.

The `path` property provides a flexible way to access data within complex object structures, allowing you to flatten nested objects or reorganize your data structure during the transformation process.

## Omitting Fields

When using wildcards to include multiple fields, you may want to exclude specific fields. The `omit` property allows you to specify fields that should be ignored during the transformation process.

### Example of using omit

```ts
const model = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  preferences: {
    theme: 'dark',
    notifications: true,
    privateInfo: 'sensitive data'
  }
};

const fields = [
  {
    key: '*',
    omit: ['password']
  },
  {
    key: 'preferences.*',
    omit: ['privateInfo']
  }
];

const { value } = useTransform(model, fields);
```

Output:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

In this example, the `password` field is omitted from the top-level object, and `privateInfo` is omitted from the `preferences` object, even though we're using wildcards to include all other fields.

## Examples

Let's explore a complex example that demonstrates various advanced features of the mapping system:

```ts
const companyData = {
  info: {
    name: 'TechCorp',
    founded: 2005,
    headquarters: {
      city: 'San Francisco',
      country: 'USA'
    }
  },
  departments: {
    engineering: {
      head: 'Jane Doe',
      employeeCount: 50,
      projects: [
        { id: 'P1', name: 'Project Alpha', status: 'active', budget: 1000000 },
        { id: 'P2', name: 'Project Beta', status: 'planning', budget: 500000 },
        { id: 'P3', name: 'Project Gamma', status: 'completed', budget: 750000 },
        { id: 'P4', name: 'Project Delta', status: 'active', budget: 1200000 }
      ]
    },
    marketing: {
      head: 'John Smith',
      employeeCount: 30,
      projects: [
        { id: 'M1', name: 'Brand Refresh', status: 'active', budget: 800000 },
        { id: 'M2', name: 'Social Media Campaign', status: 'planning', budget: 300000 },
        { id: 'M3', name: 'Product Launch', status: 'completed', budget: 500000 }
      ]
    },
    finance: {
      head: 'Alice Johnson',
      employeeCount: 15,
      budget: 500000,
      projects: [
        { id: 'F1', name: 'Cost Optimization', status: 'active', budget: 200000 },
        { id: 'F2', name: 'Financial Reporting System', status: 'planning', budget: 350000 },
        { id: 'F3', name: 'Budget Analysis', status: 'active', budget: 150000 }
      ]
    }
  },
  clients: [
    { id: 1, name: 'Acme Corp', contractValue: 500000, active: true },
    { id: 2, name: 'GlobalTech', contractValue: 750000, active: false },
    { id: 3, name: 'InnoSystems', contractValue: 1000000, active: true },
    { id: 4, name: 'TechGiants', contractValue: 1200000, active: true }
  ]
};

const currentYear = 2023;

const fields = [
  {
    key: 'companyOverview',
    fields: [
      { key: 'name', path: 'info.name' },
      { 
        key: 'age', 
        mapping: ({ model }) => currentYear - model.info.founded
      },
      {
        key: 'location',
        mapping: ({ model }) => `${model.info.headquarters.city}, ${model.info.headquarters.country}`
      }
    ]
  },
  {
    key: 'departments',
    fields: [
      {
        key: '*',
        fields: [
          'head',
          'employeeCount',
          {
            key: 'projects',
            fields: ['id', 'name', 'status'],
            filter: (project) => project.status !== 'completed'
          },
          {
            key: 'budgetAllocation',
            mapping: ({ model, key }) => {
              if (key === 'finance') return model.budget;
              if (model.projects) return model.projects.reduce((sum, p) => sum + p.budget, 0);
              if (model.campaigns) return model.campaigns.reduce((sum, c) => sum + c.budget, 0);
              return 0;
            }
          }
        ],
        omit: ['budget']
      }
    ]
  },
  {
    key: 'activeClients',
    path: 'clients',
    filter: (client) => client.active,
    fields: [
      'id',
      'name',
      {
        key: 'contractValue',
        mapping: ({ model }) => `$${(model.contractValue / 1000000).toFixed(2)}M`
      }
    ]
  },
  {
    key: 'financialSummary',
    mapping: ({ originModel }) => {
      const totalBudget = Object.values(originModel.departments).reduce((sum, dept: any) => {
        if (dept.budget) return sum + dept.budget;
        if (dept.projects) return sum + dept.projects.reduce((pSum, p) => pSum + p.budget, 0);
        if (dept.campaigns) return sum + dept.campaigns.reduce((cSum, c) => cSum + c.budget, 0);
        return sum;
      }, 0);
      const activeClientRevenue = originModel.clients
        .filter(c => c.active)
        .reduce((sum, c) => sum + c.contractValue, 0);
      return {
        totalBudget: `$${(totalBudget / 1000000).toFixed(2)}M`,
        activeClientRevenue: `$${(activeClientRevenue / 1000000).toFixed(2)}M`,
        projectedProfit: `$${((activeClientRevenue - totalBudget) / 1000000).toFixed(2)}M`
      };
    }
  }
];

const { value } = useTransform(companyData, fields);
```

**The resulting transformed data would look like this:**

Output:
```json
{
  "companyOverview": {
    "name": "TechCorp",
    "age": 18,
    "location": "San Francisco, USA"
  },
  "departments": {
    "engineering": {
      "head": "Jane Doe",
      "employeeCount": 50,
      "projects": [
        { "id": "P1", "name": "Project Alpha", "status": "active" },
        { "id": "P2", "name": "Project Beta", "status": "planning" },
        { "id": "P4", "name": "Project Delta", "status": "active" }
      ],
      "budgetAllocation": 2700000
    },
    "marketing": {
      "head": "John Smith",
      "employeeCount": 30,
      "projects": [
        { "id": "M1", "name": "Brand Refresh", "status": "active" },
        { "id": "M2", "name": "Social Media Campaign", "status": "planning" }
      ],
      "budgetAllocation": 1100000
    },
    "finance": {
      "head": "Alice Johnson",
      "employeeCount": 15,
      "projects": [
        { "id": "F1", "name": "Cost Optimization", "status": "active" },
        { "id": "F2", "name": "Financial Reporting System", "status": "planning" },
        { "id": "F3", "name": "Budget Analysis", "status": "active" }
      ],
      "budgetAllocation": 500000
    }
  },
  "activeClients": [
    { "id": 1, "name": "Acme Corp", "contractValue": "$0.50M" },
    { "id": 3, "name": "InnoSystems", "contractValue": "$1.00M" },
    { "id": 4, "name": "TechGiants", "contractValue": "$1.20M" }
  ],
  "financialSummary": {
    "totalBudget": "$4.30M",
    "activeClientRevenue": "$2.70M",
    "projectedProfit": "-$1.60M"
  }
}
```

This example showcases how the mapping system can handle complex data transformations, including nested structures, custom calculations, and selective data inclusion/exclusion. It demonstrates the power and flexibility of the system in reshaping and deriving insights from complex data structures.

This complex example demonstrates:

1. **Nested structure handling**: The company data has multiple levels of nesting, which are handled efficiently.

2. **Custom mapping**: Several fields use custom mapping functions to derive new values or format existing ones, such as calculating the company's age and formatting the location.

3. **Path usage**: The `companyOverview.name` field uses a `path` to directly access nested data from the `info` object.

4. **Wildcard with omit**: In the departments section, `'*'` is used with `omit` to include all fields except 'budget'.

5. **Filtering**: The `projects` field uses a filter function to exclude completed projects, and `activeClients` filters out inactive clients.

6. **Array handling**: The projects array in each department is transformed and filtered.

7. **Complex calculations**: The `budgetAllocation` field performs calculations based on the projects' budgets, and `financialSummary` computes totals across all departments and clients.

8. **Conditional logic**: The `budgetAllocation` mapping function uses conditional logic to handle different department structures (finance vs. others).

9. **Global context usage**: The `currentYear` variable is used in a mapping function to calculate the company's age, demonstrating how external data can be incorporated.

10. **Formatting output**: The `contractValue` and financial summary fields format monetary values into millions of dollars with a specific format.

This example illustrates the system's ability to handle diverse data structures and perform complex transformations, making it suitable for a wide range of data processing tasks.

## Transformation Process

1. The system first expands any wildcard fields in the `fields` array using the `expandWildcardFields` function.

2. For each field in the expanded fields array, the system applies the following rules in order:

   a. If the field is a simple string (key), it directly sets the value from the source model to the new model.

   b. If the field is an object (FieldObject):
      - It checks if the source model is null or empty, or if the value for the field's key is null or undefined.
      - If so, and a `default` value is specified, it uses the default value.
      - If not, it proceeds with the following steps:

   c. If a `path` is specified, it retrieves the value from the original source object using this custom path.

   d. If a `mapping` function is provided, it's called to transform the value.
      - The mapping function receives the model (or scoped model if `scope` is specified), key, new model, parent model, original model, and context.

   e. If `fields` are specified for an object or array:
      - For arrays, it applies any specified `filter` function to each element.
      - It recursively applies the transformation process to each element or nested object.

   f. If no `mapping` or `fields` are specified, but a `default` value exists, it uses the source value or the default if the source is empty.

   g. If the result of these operations is not undefined:
      - If `merge` is true, it merges the result into the new model.
      - Otherwise, it sets the result in the new model using the specified key (or `newKey` if provided).

3. Throughout this process, key formatting (e.g., camelCase) is applied if specified in the options.

4. The resulting transformed object is returned.

This process allows for flexible data access and transformation, handling nested structures, arrays, and various transformation scenarios. It ensures that wildcard expansions, default values, custom paths, mappings, and nested transformations are all applied in a logical order.

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
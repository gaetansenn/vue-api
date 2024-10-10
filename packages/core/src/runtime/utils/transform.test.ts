import { describe, it, expect } from 'vitest';
import { useTransform } from './transform';

describe('useTransform', () => {
  it('should transform a simple object with newKey', () => {
    const input = {
      name: 'John Doe',
      age: 30,
    };

    const fields = [
      'name',
      { key: 'age', newKey: 'years' },
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      name: 'John Doe',
      years: 30,
    });
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        name: 'Jane Doe',
        details: {
          age: 25,
          city: 'New York',
        },
      },
    };

    const fields = [
      {
        key: 'user',
        fields: [
          'name',
          {
            key: 'details',
            fields: [
              'age',
              { key: 'city', newKey: 'location' },
            ]
          },
        ]
      },
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      user: {
        name: 'Jane Doe',
        details: {
          age: 25,
          location: 'New York',
        },
      },
    });
  });

  it('should handle arrays with newKey', () => {
    const input = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    };

    const fields = [
      {
        key: 'users',
        fields: [
          'id',
          { key: 'name', newKey: 'fullName' },
        ]
      },
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      users: [
        { id: 1, fullName: 'Alice' },
        { id: 2, fullName: 'Bob' },
      ],
    });
  });

  it('should handle wildcard fields and retrieve only specified fields', () => {
    const input = {
      data: {
        user1: { name: 'Alice', age: 30, sexe: 'F' },
        user2: { name: 'Bob', age: 25, sexe: 'M' },
      }
    };

    const fields = [{
      key: 'data.*',
      fields: ['name'],
    }];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      data: {
        user1: { name: 'Alice' },
        user2: { name: 'Bob' },
      }
    });
  });

  it('should handle omit with wildcard key at root and nested levels', () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    };

    const fields = [
      {
        key: '*',
        omit: ['password']
      }
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      name: "John Doe",
      email: "john@example.com"
    });
  });

  it('should handle wildcard fields and retrieve only specified fields', () => {
    const input = {
      data: {
        user1: { name: 'Alice', age: 30, sexe: 'F' },
        user2: { name: 'Bob', age: 25, sexe: 'M' },
      }
    };

    const fields = [{
      key: 'data.*',
      fields: [{ key: '*', omit: ['age', 'sexe'] }],
    }];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      data: {
        user1: { name: 'Alice' },
        user2: { name: 'Bob' },
      }
    });
  });

  it('should handle wildcard fields with nested objects', () => {
    const input = {
      data: {
        user1: { name: 'Alice', age: 30 },
        user2: { name: 'Bob', age: 25 },
      }
    };

    const fields = ['data.*.name'];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      data: {
        user1: { name: 'Alice' },
        user2: { name: 'Bob' },
      }
    });
  })

  it('should handle nested wildcard fields with renaming and mapping', () => {
    const input = {
      test: {
        a: {
          subField: {
            name: 'Sub 1',
            age: [10, 20],
          }
        },
        b: {
          subField: {
            name: 'Sub 2',
            age: [20, 30],
          }
        }
      }
    };

    const fields = [
      {
        key: 'test.*.subField',
        fields: [{
          key: 'name',
          newKey: 'fullName'
        },
        {
          key: 'age',
          mapping: ({ model }) => {
            return model.age.map((age) => age * 2);
          }
        }]
      },
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      test: {
        a: {
          subField: {
            fullName: 'Sub 1',
            age: [20, 40],
          }
        },
        b: {
          subField: {
            fullName: 'Sub 2',
            age: [40, 60],
          }
        }
      }
    });
  });

  it('should handle scope with nested fields', () => {
    const input = {
      user: {
        profile: {
          name: 'Jane Doe',
          address: {
            city: 'New York',
            country: 'USA'
          }
        }
      }
    };

    const fields = [
      {
        key: 'userInfo',
        scope: 'user.profile',
        fields: [
          'name',
          { key: 'location', fields: ['city', 'country'], scope: 'user.profile.address' }
        ]
      }
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      userInfo: {
        name: 'Jane Doe',
        location: {
          city: 'New York',
          country: 'USA'
        }
      }
    });
  });

  it('should handle path with wildcard', () => {
    const input = {
      data: {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ]
      }
    };

    const fields = [
      {
        key: 'users',
        path: 'data.users',
        fields: ['id', 'name']
      }
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
    });
  });

  it('should handle scope with mapping', () => {
    const input = {
      company: {
        employees: [
          { name: 'Alice', role: 'developer' },
          { name: 'Bob', role: 'designer' }
        ]
      }
    };

    const fields = [
      {
        key: 'staff',
        scope: 'company.employees',
        fields: [
          'name',
          {
            key: 'position',
            mapping: ({ model }) => model.role.toUpperCase()
          }
        ]
      }
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      staff: [
        { name: 'Alice', position: 'DEVELOPER' },
        { name: 'Bob', position: 'DESIGNER' }
      ]
    });
  });

  it('should handle path with default value', () => {
    const input = {
      settings: {
        theme: 'dark'
      }
    };

    const fields = [
      { key: 'theme', path: 'settings.theme' },
      { key: 'language', path: 'settings.language', default: 'en' }
    ];

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      theme: 'dark',
      language: 'en'
    });
  });

  it('should handle wildcard with specific field override', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }

    const fields = [
      '*',
      { key: 'email', mapping: ({ model }) => model.email.replace('@example.com', '@gmail.com') }
    ]

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@gmail.com',
    });
  })

  it('should handle wildcard with specific array field override', () => {
    const input = {
      users: [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }, {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      }]
    }

    const fields = [
      {
        key: 'users',
        fields: [
          '*',
          { key: 'email', mapping: ({ model }) => model.email.replace('@example.com', '@gmail.com') }
        ]
      }
    ]

    const { value } = useTransform(input, fields);

    expect(value).toEqual({
      users: [
        { firstName: 'John', lastName: 'Doe', email: 'john@gmail.com' },
        { firstName: 'Jane', lastName: 'Doe', email: 'jane@gmail.com' }
      ]
    });
  })

  it('should handle wildcard on root level with array', () => {
    const input = [{
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }, {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    }]

    const fields = [
      '*',
      { key: 'email', mapping: ({ model }) => model.email.replace('@example.com', '@gmail.com') }
    ]

    const { value } = useTransform(input, fields);

    expect(value).toEqual(
      [
        { firstName: 'John', lastName: 'Doe', email: 'john@gmail.com' },
        { firstName: 'Jane', lastName: 'Doe', email: 'jane@gmail.com' }
      ]
    );
  })

});

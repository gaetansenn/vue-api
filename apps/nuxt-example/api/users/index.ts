import type { Field, IRequestOptions  } from '@vue-api/core'
import { useTransform, handleWildcard } from '@vue-api/core'

export interface User {
  id: String;
  name: String;
  to?: String;
}

export default function () {
  const $fetch = useFetchModel({
    baseURL: 'https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users'
  })

  const USER_FIELD = ['id', 'name']
  const USER_FIELDS: Field[] = [...USER_FIELD, {
    key: 'to',
    mapping: ({ model }: { model: any }) => {
      return { name: 'id', params: { id: model.id } }
    }
  }]


  // const model = {
  //   company: {
  //     departments: {
  //       engineering: { 
  //         employees: 50,
  //         projects: 5,
  //         budget: {
  //           allocated: 1000000,
  //           spent: 750000
  //         }
  //       },
  //       marketing: { 
  //         employees: 30,
  //         campaigns: 3,
  //         budget: {
  //           allocated: 500000,
  //           spent: 450000
  //         }
  //       },
  //       hr: { 
  //         employees: 15,
  //         openPositions: 2,
  //         budget: {
  //           allocated: 300000,
  //           spent: 280000
  //         }
  //       }
  //     }
  //   }
  // };

  // console.log(JSON.stringify(handleWildcard(model, 'company.departments.*.employees'), null, 2));
  // console.log(JSON.stringify(handleWildcard(model, 'company.departments.*.budget.allocated'), null, 2));



  const complexModel = {
    company: {
      name: 'TechCorp',
      departments: {
        engineering: { 
          employees: 50,
          projects: ['Project A', 'Project B'],
          budget: { allocated: 1000000, spent: 750000 }
        },
        marketing: { 
          employees: 30,
          campaigns: ['Campaign X', 'Campaign Y'],
          budget: { allocated: 500000, spent: 450000 }
        },
        hr: { 
          employees: 15,
          openPositions: 2,
          budget: { allocated: 300000, spent: 280000 }
        }
      },
      locations: ['New York', 'San Francisco', 'London']
    },
    clients: [
      { id: 1, name: 'Client A', active: true },
      { id: 2, name: 'Client B', active: false },
      { id: 3, name: 'Client C', active: true }
    ]
  };
  
  const complexFields: Field[] = [
    'company.name',
    {
      key: 'company.departments.*',
      fields: [
        {
          key: 'budget.allocated',
          scope: 'clients',
          mapping: ({ model }) => {
            // return model
            console.log('model', model)
            return 'hey'
            // return `$${model.allocated / 1000000}M`
          }
        }
      ]
    },
    // {
    //   key: 'company.departments.*.projects',
    // },
    // {
    //   key: 'company.locations',
    //   scope: 'company.locations',
    //   mapping: ({ model }) => `Office: ${model}`
    // },
    // {
    //   key: 'clients',
    //   fields: [
    //     'id',
    //     'name',
    //     {
    //       key: 'active',
    //       mapping: ({ model }) => model ? 'Yes' : 'No'
    //     }
    //   ]
    // },
    // {
    //   key: 'missingField',
    //   default: 'Default Value'
    // }
  ];
  
  const { getEmpty, value } = useTransform(complexModel, complexFields);
  
  // console.log('Empty Model:');
  // console.log(JSON.stringify(getEmpty(), null, 2));
  
  console.log('\nTransformed Model:');
  console.log(JSON.stringify(value, null, 4));

  return {
    findOne: async (userId: string, options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<User>(userId, {
        ...options,
        transform: {
          fields: USER_FIELD,
          context: {}
        }
      })
    },
    get: async (options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return []
      // return $fetch.get<User[]>({
      //   ...options,
      //   transform: {
      //     fields: USER_FIELDS,
      //     context: {}
      //   }
      // })
    },
  }
}
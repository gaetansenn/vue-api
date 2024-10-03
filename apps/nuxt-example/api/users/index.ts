import type { Field, IRequestOptions } from '@vue-api/core'
import { useTransform } from '@vue-api/core'

interface Project {
  name: string;
  status: string;
  statusSummary?: string;
}

interface Department {
  title: string;
  role: string;
  projects: Project[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  departments: {
    [key: string]: Department;
  };
  skills: string[];
  departmentSummary?: { [key: string]: string };
  totalProjects?: number;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalProjects?: number;
  departmentSummary?: { [key: string]: string };
}

export default async function () {
  const $fetch = useFetchModel({
    baseURL: 'https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users'
  })

  const USER_FIELDS: Field[] = [
    { key: '*', omit: ['password'] },
    'departments',
    {
      key: 'departments.*.projects',
      fields: ['*', {
        key: 'statusSummary',
        mapping: ({ model }: { model: Project }) => {
          const statusEmoji = model.status.toLowerCase() === 'completed' ? '✅' :
                              model.status.toLowerCase() === 'in progress' ? '🚧' : '🔜';
          return `${statusEmoji} ${model.name} (${model.status})`;
        }
      }]
    },
    {
      key: 'departmentSummary',
      mapping: ({ model }: { model: User }) => {
        return Object.entries(model.departments).reduce((acc, [key, dept]) => {
          acc[key] = `${dept.role} in ${dept.title} (${dept.projects.length} projects)`;
          return acc;
        }, {} as { [key: string]: string });
      }
    },
    {
      key: 'totalProjects',
      mapping: ({ model }: { model: User }) => {
        return Object.values(model.departments).reduce((total, dept) => total + dept.projects.length, 0);
      }
    }
  ]

  const USERS_FIELDS: Field[] = [
    'id',
    'name',
    'email',
    'avatar',
    {
      key: 'totalProjects',
      mapping: ({ model }: { model: User }) => {
        return Object.values(model.departments).reduce((total, dept) => total + dept.projects.length, 0);
      }
    },
    {
      key: 'departmentSummary',
      mapping: ({ model }: { model: User }) => {
        return Object.entries(model.departments).reduce((acc, [key, dept]) => {
          acc[key] = `${dept.role} in ${dept.title} (${dept.projects.length} projects)`;
          return acc;
        }, {} as { [key: string]: string });
      }
    }
  ]

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
          { id: 'P3', name: 'Project Gamma', status: 'completed', budget: 750000 }
        ]
      },
      // marketing: {
      //   head: 'John Smith',
      //   employeeCount: 30,
      //   campaigns: [
      //     { id: 'C1', name: 'Summer Sale', status: 'active', budget: 200000 },
      //     { id: 'C2', name: 'Product Launch', status: 'planning', budget: 300000 }
      //   ]
      // },
      // finance: {
      //   head: 'Alice Johnson',
      //   employeeCount: 15,
      //   budget: 500000
      // }
    },
    clients: [
      { id: 1, name: 'Acme Corp', contractValue: 500000, active: true },
      { id: 2, name: 'GlobalTech', contractValue: 750000, active: false },
      { id: 3, name: 'InnoSystems', contractValue: 1000000, active: true }
    ]
  };
  
  const currentYear = 2023;
  
  const fields = [
    // {
    //   key: 'companyOverview',
    //   fields: [
    //     { key: 'name', path: 'info.name' },
    //     { 
    //       key: 'age',
    //       mapping: ({ model }) => {
    //         return currentYear - model.info.founded
    //       }
    //     },
    //     {
    //       key: 'location',
    //       mapping: ({ model }) => `${model.info.headquarters.city}, ${model.info.headquarters.country}`
    //     }
    //   ]
    // },
    {
      key: 'departments.*',
      omit: ['budget'],
      fields: [
        // 'head',
        // 'employeeCount',
        // {
        //   key: 'projects',
        //   fields: ['id', 'name', 'status'],
        //   filter: (project) => project.status !== 'completed'
        // },
        {
          key: 'campaigns',
          fields: ['id', 'name', 'status']
        },
        // {
        //   key: 'budgetAllocation',
        //   mapping: ({ model, key }) => {
        //     if (key === 'finance') return model.budget;
        //     if (model.projects) return model.projects.reduce((sum, p) => sum + p.budget, 0);
        //     if (model.campaigns) return model.campaigns.reduce((sum, c) => sum + c.budget, 0);
        //     return 0;
        //   }
        // },
        
      ],
    },
    // {
    //   key: 'activeClients',
    //   path: 'clients',
    //   filter: (client) => client.active,
    //   fields: [
    //     'id',
    //     'name',
    //     {
    //       key: 'contractValue',
    //       mapping: ({ model }) => `$${(model.contractValue / 1000000).toFixed(2)}M`
    //     }
    //   ]
    // },
    // {
    //   key: 'financialSummary',
    //   mapping: ({ originModel }) => {
    //     const totalBudget = Object.values(originModel.departments).reduce((sum, dept: any) => {
    //       if (dept.budget) return sum + dept.budget;
    //       if (dept.projects) return sum + dept.projects.reduce((pSum, p) => pSum + p.budget, 0);
    //       if (dept.campaigns) return sum + dept.campaigns.reduce((cSum, c) => cSum + c.budget, 0);
    //       return sum;
    //     }, 0);
    //     const activeClientRevenue = originModel.clients
    //       .filter(c => c.active)
    //       .reduce((sum, c) => sum + c.contractValue, 0);
    //     return {
    //       totalBudget: `$${(totalBudget / 1000000).toFixed(2)}M`,
    //       activeClientRevenue: `$${(activeClientRevenue / 1000000).toFixed(2)}M`,
    //       projectedProfit: `$${((activeClientRevenue - totalBudget) / 1000000).toFixed(2)}M`
    //     };
    //   }
    // }
  ];
  
  console.dir(await useTransform(companyData, fields).value, { depth: null })

  return {
    findOne: async (userId: string, options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<User>(userId, {
        ...options,
        transform: {
          fields: USER_FIELDS,
          context: {}
        }
      })
    },
    get: async (options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<UserListItem[]>({
        ...options,
        transform: {
          fields: USERS_FIELDS,
          context: {}
        }
      })
    },
  }
}
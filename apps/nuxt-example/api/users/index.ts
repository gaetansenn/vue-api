import type { Field, IRequestOptions } from '@vue-api/core'

interface Project {
  name: string;
  status: string;
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

export default function () {
  const $fetch = useFetchModel({
    baseURL: 'https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users'
  })

  const USER_FIELDS: Field[] = [
    'id',
    'name',
    'email',
    'avatar',
    'skills',
    {
      key: 'departments.*.title',
    },
    {
      key: 'departments.*.role',
    },
    {
      key: 'departments.*.projects',
      fields: ['name', 'status']
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
      return $fetch.get<User[]>({
        ...options,
        transform: {
          fields: USER_FIELDS,
          context: {}
        }
      })
    },
  }
}
import { IRequestOptions, useOfetchModel, Field } from '@vue-api/core'

export interface User {
  id: String;
  name: String;
  to?: String;
}

const USER_FIELD = ['id', 'name']

const USER_FIELDS: Field[] = [...USER_FIELD, {
  key: 'to',
  mapping: ({ model }: { model: any }) => {
    const router = useRouter()

    return router.resolve('users')
  }
}]

export default function () {
  console.log('init users')
  const $fetch = useOfetchModel()

  return {
    findOne: async (userId: string, options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<User>(`https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users/${userId}`, {
        ...options,
        transform: {
          fields: USER_FIELD,
          context: {}
        }
      })
    },
    get: async (options?: IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<User[]>('https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users', {
        ...options,
        transform: {
          fields: USER_FIELDS,
          context: {}
        }
      })
    },
  }
}
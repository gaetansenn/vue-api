import type { Field, IRequestOptions } from '@vue-api/core'
import { useOfetchModel } from '@vue-api/core'

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
  const router = useRouter()

  const USER_FIELDS: Field[] = [...USER_FIELD, {
    key: 'to',
    mapping: ({ model }: { model: any }) => {
      return router.resolve({ name: 'users'}).href
    }
  }]

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
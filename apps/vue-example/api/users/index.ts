export interface User {
  id: String;
  name: String;
  to?: String;
}

export default function () {
  const $fetch = useOfetchModel({
    baseURL: 'https://64cbdfbd2eafdcdc85196e4c.mockapi.io/users'
  })

  console.log('$fetch is', $fetch)

  const USER_FIELD = ['id', 'name']

  const USER_FIELDS: typeof Field[] = [...USER_FIELD]

  return {
    findOne: async (userId: string, options?: typeof IRequestOptions<Omit<RequestInit, 'body'>>) => {
      return $fetch.get<User>(userId, {
        ...options,
        transform: {
          fields: USER_FIELD,
          context: {}
        }
      })
    },
    get: async (options?: typeof IRequestOptions<Omit<RequestInit, 'body'>>) => {
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
import axios from 'axios'

const addressServerUrl = import.meta.env.VITE_BASE_API_URL

const instance = axios.create({
  withCredentials: true,
  baseURL: addressServerUrl,
})

export const getWhoami = async () => {
  if (addressServerUrl) {
    return await instance.get(`/whoami`)
  } else {
    throw new Error('Address server url is not defined')
  }
}

export const login = async ({ email, password }: { email: string; password: string }) => {
  if (addressServerUrl) {
    return await instance.post(`/login`, {
      email: email,
      password: password,
    })
  } else {
    throw new Error('Address server url is not defined')
  }
}

export const logout = async () => {
  if (addressServerUrl) {
    return await instance.get(`/logout`)
  } else {
    throw new Error('Address server url is not defined')
  }
}

export const register = async ({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name: string
}) => {
  if (addressServerUrl) {
    return await instance.post(`/register`, {
      email: email,
      password: password,
      name: name,
    })
  } else {
    throw new Error('Address server url is not defined')
  }
}

export const getTodos = async () => {
  if (addressServerUrl) {
    return await instance.get(`/todos`)
  } else {
    throw new Error('Address server url is not defined')
  }
}

export const addTodo = async ({ Todo, Category }: { Todo: string; Category: string }) => {
  if (addressServerUrl) {
    return await instance.post(`/todos`, {
      Todo: Todo,
      Category: Category,
      IsChecked: false,
    })
  } else {
    throw new Error('Address server url is not defined')
  }
}

export const putTodo = async ({
  ID,
  Todo,
  Category,
  IsChecked,
}: {
  ID: number
  Todo?: string
  Category?: string
  IsChecked?: boolean
}) => {
  if (addressServerUrl) {
    return await instance.put(`/todos/${ID}`, {
      Todo: Todo,
      Category: Category,
      IsChecked: IsChecked,
    })
  } else {
    throw new Error('Address server url is not defined')
  }
}

export const deleteTodo = async (ID: number) => {
  if (addressServerUrl) {
    return await instance.delete(`/todos/${ID}`)
  } else {
    throw new Error('Address server url is not defined')
  }
}

<script setup lang="ts">
import { ref, watch, computed, onMounted, reactive } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import {
  addTodo,
  deleteTodo,
  getTodos,
  getWhoami,
  login,
  logout,
  putTodo,
  register,
} from './fetchers/index'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const name = ref(false)
const todo = ref('')
const todos = ref<
  {
    ID: number
    CreatedAt: string
    UpdatedAt: string
    DeletedAt: string
    Todo: string
    Category: string
    IsChecked: boolean
  }[]
>([])
const openLogin = ref(false)
const openRegister = ref(false)
const usernameShow = ref('')
const onError = ref(false)

const categories = ref([
  {
    label: 'Business',
    value: 'business',
  },
  {
    label: 'Personal',
    value: 'personal',
  },
])

const selectedCategory = ref('')

const stateLogin = reactive({
  email: '',
  password: '',
})

const stateRegister = reactive({
  name: '',
  email: '',
  password: '',
})

const toast = useToast()

function showToast(
  title?: string,
  description?: string,
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral'
    | undefined,
) {
  toast.add({
    title: title,
    description: description,
    color: color,
  })
}

const disabledButton = computed(() => {
  return selectedCategory.value != '' && todo.value.trim() != '' ? false : true
})

const disabledButtonModal = computed(() => {
  return (stateLogin.email != '' && stateLogin.password.trim() != '') ||
    (stateRegister.name != '' &&
      stateRegister.email != '' &&
      stateRegister.password.trim() != '' &&
      stateRegister.password.trim().length >= 8 &&
      /[A-Z]/.test(stateRegister.password) &&
      /[a-z]/.test(stateRegister.password) &&
      /\d/.test(stateRegister.password))
    ? false
    : true
})

const handleAddTodo = async () => {
  if (selectedCategory.value != '' && todo.value.trim() != '') {
    await addTodo({ Todo: todo.value, Category: selectedCategory.value })
      .then(() => {
        showToast('Todo Created', 'Created Successfully', 'success')
        selectedCategory.value = ''
        todo.value = ''
        handleTodosData()
      })
      .catch((error) => {
        showToast('Error', 'Failed to create todo.', 'error')
        console.log(error)
      })
  }
}

const handleUpdateTodo = async (item: {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string
  Todo: string
  Category: string
  IsChecked: boolean
}) => {
  await putTodo({
    ID: item.ID,
    Todo: item.Todo,
    Category: item.Category,
    IsChecked: !item.IsChecked,
  })
    .then(() => {
      handleTodosData()
      showToast('Todo Updated', 'Updated Successfully', 'success')
    })
    .catch((error) => {
      showToast('Error', 'Failed to update todo.', 'error')
      console.log(error)
    })
}
const handleDeleteTodo = async (id: number) => {
  await deleteTodo(id)
    .then(() => {
      handleTodosData()
      showToast('Todo Deleted', 'Deleted Successfully', 'success')
    })
    .catch((error) => {
      showToast('Error', 'Failed to delete todo.', 'error')
      console.log(error)
    })
}

const handleLogin = async (email?: string, password?: string) => {
  if ((stateLogin.email.trim() != '' && stateLogin.password.trim() != '') || (email && password)) {
    await login({
      email: email ?? stateLogin.email.trim(),
      password: password ?? stateLogin.password.trim(),
    })
      .then(() => {
        openLogin.value = false
        onError.value = false
        window.location.reload()
        showToast('Login Success', `Welcome back, ${usernameShow.value}!`, 'success')
      })
      .catch((error) => {
        showToast('Login Failed', 'Invalid username or password.', 'error')
        onError.value = true
        console.log(error)
      })
  }
}

const handleLogout = async () => {
  await logout()
    .then(() => {
      window.location.reload()
      showToast('Logout Success', '', 'success')
    })
    .catch((error) => {
      showToast('Logout Failed', '', 'error')
      console.log(error)
    })
}

const handleRegister = async () => {
  if (
    stateRegister.email.trim() != '' &&
    stateRegister.password.trim() != '' &&
    stateRegister.name.trim() != ''
  ) {
    await register({
      email: stateRegister.email.trim(),
      password: stateRegister.password.trim(),
      name: stateRegister.name.trim(),
    })
      .then(() => {
        showToast('Register Success', '', 'success')
        handleLogin(stateRegister.email.trim(), stateRegister.password.trim())
        onError.value = false
        openRegister.value = false
      })
      .catch((error) => {
        showToast('Register Failed', `username already existed!`, 'error')
        onError.value = true
        console.log(error)
      })
  }
}

const handleTodosData = async () => {
  await getTodos()
    .then((res) => {
      if (res.status === 200) {
        todos.value = res.data
      } else {
        showToast('Error', 'Failed to fetch todos.', 'error')
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

const handleWhoami = async () => {
  await getWhoami()
    .then((res) => {
      if (res.status === 200) {
        handleTodosData()
        name.value = true
        usernameShow.value = res.data.name
      } else {
        name.value = false
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

watch(openLogin, (newOpen) => {
  if (newOpen) {
    stateLogin.email = ''
    stateLogin.password = ''
  }
})

watch(openRegister, (newOpen) => {
  if (newOpen) {
    stateRegister.name = ''
    stateRegister.email = ''
    stateRegister.password = ''
  }
})

watch(name, (nameChange) => {
  if (nameChange) {
    handleWhoami()
  }
})

onMounted(() => {
  handleWhoami()
})
</script>

<template>
  <UApp>
    <div class="bg-[#EEF0EB] text-[#153243] h-screen">
      <div class="p-4 flex flex-col gap-6 text-nowrap max-w-[1440px] mx-auto">
        <div class="flex items-center gap-2 text-[#153243] text-xl font-semibold">
          <div>What's up,</div>
          <div v-if="name" class="w-full flex justify-between items-center">
            <div>
              {{ usernameShow }}
            </div>
            <div>
              <UButton
                class="text-[#284B63] bg-[#B4B8AB] hover:opacity-70 hover:bg-[#B4B8AB] cursor-pointer rounded p-2 outline-none transition-all text-xl"
                loading-auto
                @click="handleLogout"
                >Logout</UButton
              >
            </div>
          </div>
          <div v-else class="flex gap-2">
            <UModal
              v-model:open="openLogin"
              title="Login"
              description="Please login to see your todos."
              :ui="{ footer: 'justify-end' }"
            >
              <UButton
                class="text-[#284B63] bg-[#B4B8AB] hover:opacity-70 hover:bg-[#B4B8AB] cursor-pointer rounded p-2 outline-none transition-all text-xl"
                loading-auto
                >Login</UButton
              >

              <template #body>
                <UForm :state="stateLogin" class="space-y-4" @submit="handleLogin()">
                  <div class="flex flex-col gap-4">
                    <UFormField label="Email" name="email">
                      <input
                        type="email"
                        class="p-2 rounded bg-[#EEF0EB] text-[#284B63] outline-none transition-all w-full"
                        :class="onError ? 'border border-red-500' : ''"
                        placeholder="Email"
                        v-model="stateLogin.email"
                      />
                    </UFormField>
                    <UFormField label="Password" name="password">
                      <input
                        type="password"
                        class="p-2 rounded bg-[#EEF0EB] text-[#284B63] outline-none transition-all w-full"
                        :class="onError ? 'border border-red-500' : ''"
                        placeholder="Password"
                        v-model="stateLogin.password"
                      />
                    </UFormField>
                  </div>
                  <div class="flex justify-end gap-2">
                    <UButton
                      label="Cancel"
                      color="neutral"
                      variant="outline"
                      @click="openLogin = false"
                      class="cursor-pointer"
                    />
                    <UButton
                      label="Login"
                      color="neutral"
                      class="cursor-pointer"
                      :disabled="disabledButtonModal"
                      type="submit"
                    />
                  </div>
                </UForm>
              </template>
            </UModal>
            <!-- register -->
            <UModal
              v-model:open="openRegister"
              title="Register"
              description="Not have an account? Register now!"
              :ui="{ footer: 'justify-end' }"
            >
              <UButton
                class="text-[#284B63] bg-[#B4B8AB] hover:opacity-70 hover:bg-[#B4B8AB] cursor-pointer rounded p-2 outline-none transition-all text-xl"
                loading-auto
                >Register</UButton
              >

              <template #body>
                <UForm :state="stateRegister" class="space-y-4" @submit="handleRegister">
                  <div class="flex flex-col gap-4">
                    <UFormField label="Name" name="name">
                      <input
                        type="text"
                        class="p-2 rounded bg-[#EEF0EB] text-[#284B63] outline-none transition-all w-full"
                        :class="onError ? 'border border-red-500' : ''"
                        placeholder="Name"
                        v-model="stateRegister.name"
                      />
                    </UFormField>
                    <UFormField label="Email" name="email">
                      <input
                        type="email"
                        class="p-2 rounded bg-[#EEF0EB] text-[#284B63] outline-none transition-all w-full"
                        :class="onError ? 'border border-red-500' : ''"
                        placeholder="Email"
                        v-model="stateRegister.email"
                      />
                    </UFormField>
                    <UFormField label="Password" name="password">
                      <input
                        type="password"
                        class="p-2 rounded bg-[#EEF0EB] text-[#284B63] outline-none transition-all w-full"
                        :class="onError ? 'border border-red-500' : ''"
                        placeholder="Password"
                        v-model="stateRegister.password"
                      />
                      <div class="text-gray-400 text-[12px] mt-1">
                        Password must be at least 8 characters long. Must contain at least 1
                        uppercase letter, 1 lowercase letter and 1 number.
                      </div>
                    </UFormField>
                  </div>
                  <div class="flex justify-end gap-2">
                    <UButton
                      label="Cancel"
                      color="neutral"
                      variant="outline"
                      @click="openRegister = false"
                      class="cursor-pointer"
                    />
                    <UButton
                      label="Register"
                      color="neutral"
                      class="cursor-pointer"
                      :disabled="disabledButtonModal"
                      type="submit"
                    />
                  </div>
                </UForm>
              </template>
            </UModal>
          </div>
        </div>
        <div>
          <div>CREATE A TODO</div>
          <form class="flex flex-col gap-2" @submit.prevent="handleAddTodo">
            <div class="flex flex-col gap-1">
              <div class="text-sm text-[#284B63]">What's on your todo list?</div>
              <input
                type="text"
                class="p-2 rounded bg-[#B4B8AB] text-[#284B63] outline-none transition-all w-full"
                placeholder="Type here..."
                v-model="todo"
              />
            </div>

            <div class="flex flex-col gap-1">
              <div class="text-sm text-[#284B63]">Pick a category</div>

              <div class="flex gap-4">
                <URadioGroup
                  orientation="horizontal"
                  :items="categories"
                  v-model="selectedCategory"
                  :ui="{
                    item: 'bg-white p-2 py-6 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full cursor-pointer flex-col justify-center items-center',
                    label: 'flex justify-center m-0 text-[#284B63]',
                    wrapper: 'm-0',
                    indicator: 'bg-[#284B63] transition-all',
                  }"
                  class="w-full gap-4"
                />
              </div>
            </div>

            <UButton
              type="submit"
              class="bg-[#153243] justify-center text-white p-2 rounded-md hover:bg-[#284B63] transition-all cursor-pointer disabled:bg-[#153243]"
              loading-auto
              :disabled="disabledButton"
            >
              Add Todo
            </UButton>
          </form>
        </div>

        <div>
          <div>Todo Lists</div>
          <ul class="flex flex-col gap-2">
            <li
              v-for="(item, index) in todos"
              :key="index"
              class="bg-white rounded-md p-4 w-full shadow-[0_4px_30px_rgb(0,0,0,0.12)] flex gap-2 items-center justify-between"
            >
              <div class="flex gap-2 items-center">
                <UCheckbox
                  @update:model-value="() => handleUpdateTodo(item)"
                  v-model="item.IsChecked"
                  :ui="{
                    indicator: 'bg-[#284B63]',
                    base: 'cursor-pointer w-5 h-5',
                  }"
                />
                <div :class="item.IsChecked && 'text-gray-400'">
                  {{ item.Todo }}
                  <UBadge :color="item.Category == 'business' ? 'secondary' : 'success'">{{
                    item.Category
                  }}</UBadge>
                </div>
              </div>
              <Trash2 class="cursor-pointer text-red-500" @click="handleDeleteTodo(item.ID)" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </UApp>
</template>

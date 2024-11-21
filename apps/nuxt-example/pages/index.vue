<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">User Directory</h1>
    <div v-if="users.status.value === 'pending'" class="text-center text-gray-600">
      <p class="text-xl">Loading users...</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="user in users.data.value" :key="user.id" class="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:scale-105">
        <NuxtLink :to="`/${user.id}`" class="block">
          <img :src="user.avatar" :alt="user.name" class="w-full h-48 object-cover">
          <div class="p-4">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ user.name }}</h2>
            <p class="text-gray-600 mb-2">{{ user.email }}</p>
            <p class="text-gray-700 mb-2">Total Projects: {{ user.totalProjects }}</p>
            <div class="mt-4">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Departments:</h3>
              <ul class="list-disc list-inside">
                <li v-for="(summary, dept) in user.departmentSummary" :key="dept" class="text-gray-600">
                  {{ dept }}: {{ summary }}
                </li>
              </ul>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const { get } = useApiUsers()

const users = await get()

</script>

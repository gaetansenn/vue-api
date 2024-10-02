<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="user.status.value === 'pending'" class="text-center text-gray-600">
      <p class="text-xl">Loading ...</p>
    </div>
    <div v-else-if="user.data.value" class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="md:flex">
        <div class="md:flex-shrink-0">
          <img :src="user.data.value.avatar" :alt="user.data.value.name" class="h-48 w-full object-cover md:w-48">
        </div>
        <div class="p-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ user.data.value.name }}</h1>
          <p class="text-gray-600">{{ user.data.value.email }}</p>
          <p class="text-gray-700 mt-2">Total Projects: {{ user.data.value.totalProjects }}</p>
        </div>
      </div>
      
      <div class="p-8 border-t border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Departments and Projects</h2>
        <div v-for="(dept, deptName) in user.data.value.departments" :key="deptName" class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700">{{ dept.title }} ({{ deptName }})</h3>
          <p class="text-gray-600 mb-2">Role: {{ dept.role }}</p>
          <h4 class="text-md font-semibold text-gray-700 mb-2">Projects:</h4>
          <ul class="list-disc list-inside">
            <li v-for="project in dept.projects" :key="project.name" class="text-gray-600">
              <span v-html="project.statusSummary"></span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="p-8 bg-gray-50">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="skill in user.data.value.skills" :key="skill" 
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="mt-8">
      <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
        &larr; Return to users list
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { params } = useRoute()
const { findOne } = useApiUsers()

const user = await findOne(params.id as string)
</script>
<template>
  <div>
    <div v-for="user in users" :key="(user.id as string)">
      {{ user.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { get } = useApiUsers()

const users = await get()
</script>
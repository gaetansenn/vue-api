<template>
  <div v-if="users.pending.value">Chargement ...</div>
  <div v-else>
    <NuxtLink :href="(user.to as string)" v-for="user in users.data.value" :key="(user.id as string)">
      {{ user.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
console.log('setup init')
const { get } = useApiUsers()

const users = await useAsyncData('users', () => get())

console.log(users.data)
</script>
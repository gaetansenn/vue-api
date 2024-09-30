<template>
  <div v-if="users.status.value === 'pending'">Chargement ...</div>
  <div v-else>
    <NuxtLink :href="(user.to as string)" v-for="user in users.data.value" :key="(user.id as string)">
      {{ user.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { get } = useApiUsers()

const users = await get()

</script>
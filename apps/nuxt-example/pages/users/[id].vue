<template>
  <div>
    {{ user.data }}
  </div>
</template>

<script setup lang="ts">
const { params } = useRoute()
const { findOne } = useApiUsers()

const user = await useAsyncData(() => findOne(params.id as string))
</script>
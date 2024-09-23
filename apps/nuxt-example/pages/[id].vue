<template>
  <div>
    {{ user.data }}
  </div>
</template>

<script setup lang="ts">
const { params } = useRoute()
const { findOne } = useApiUsers()

const user = await findOne(params.id as string)
</script>
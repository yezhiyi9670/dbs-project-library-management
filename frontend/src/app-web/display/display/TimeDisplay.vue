<script setup lang="ts">
defineProps<{
  timestamp: number,
  overdue?: boolean
}>()
</script>

<template>
  <span>
    {{ new Date(timestamp * 1000).toLocaleString() }}
    <v-icon v-if="overdue" icon="mdi-clock-alert-outline" />
  </span>
</template>

<style scoped>
  .time-overdue {
    color: red;
    font-weight: bold;
  }
</style>

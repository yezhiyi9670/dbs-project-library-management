<script setup lang="ts">
defineProps<{
  timestamp: number,
  overdue?: boolean
}>()
</script>

<template>
  <span :class="overdue ? 'time-overdue' : 'time-normal'">
    {{ new Date(timestamp * 1000).toLocaleString() }}
  </span>
</template>

<style scoped>
  .time-overdue {
    color: red;
    font-weight: bold;
  }
</style>

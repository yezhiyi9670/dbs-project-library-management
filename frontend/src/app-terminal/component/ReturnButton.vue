<script setup lang="ts">
const props = defineProps<{
  icon: string,
  to: string
}>()

</script>

<template>
  <v-btn variant="tonal" class="back-button" :to="props.to"><v-icon :icon="props.icon" /> <slot /></v-btn>
</template>

<style scoped>
  .back-button {
    position: absolute;
    left: 32px;
    top: 32px;
  }
</style>

<script setup lang="ts">

const emit = defineEmits<{
  click: []
}>()
const props = defineProps<{
  icon: string,
}>()



</script>

<template>
  <v-btn variant="tonal" class="tile-button">
    <div class="tile-button-i">
      <v-icon class="tile-button-icon" :size="80" :icon="props.icon" />
      <div class="tile-button-label">
        <slot />
      </div>
    </div>
  </v-btn>
</template>

<style scoped>
  .tile-button {
    height: 200px;
    width: 180px;
    padding-top: 24px;
  }
  .tile-button-label {
    margin-top: 18px;
    height: 52px;
    font-size: 20px;
    text-transform: none;
  }
</style>

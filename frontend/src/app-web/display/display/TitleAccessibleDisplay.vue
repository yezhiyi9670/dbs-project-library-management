<script setup lang="ts">
import Title from '@library-management/common/entity/title';

defineProps<{
  title: Title
}>()

</script>

<template>
  <div class="accessible-display">
    <v-icon icon="mdi-book-open-blank-variant-outline" :style="{visibility: title.place ? 'visible' : 'hidden'}" :title="title.place" />
    <a :href="title.url" target="_blank"><v-icon icon="mdi-link-variant" :style="{visibility: title.url ? 'visible' : 'hidden'}" /></a>
  </div>
</template>

<style scoped>
  .accessible-display {
    display: flex;
    gap: 4px;
  }
</style>

<script setup lang="ts">
import Title from '@library-management/common/entity/title';

defineProps<{
  title: Title
}>()

</script>

<template>
  <div class="book-title-display">
    <RouterLink :to="'/book-details/' + title.book_number" target="_blank">
      {{ title.title }}
      <v-icon icon="mdi-arrow-right" />
    </RouterLink>
  </div>
</template>

<style scoped>
  .book-title-display {
    display: flex;
    gap: 4px;
  }
</style>

<script setup lang="ts">
import Title from '@library-management/common/entity/title';

defineProps<{
  title: Title
}>()

</script>

<template>
  <div class="accessible-display">
    <RouterLink :to="'/book-details/' + title.book_number" target="_blank">
      <v-icon icon="mdi-arrow-right" />
    </RouterLink>
  </div>
</template>

<style scoped>
  .accessible-display {
    display: flex;
    gap: 4px;
  }
</style>

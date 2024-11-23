<script setup lang="ts">
import TwiceDeleteIcon from '../../component/TwiceDeleteIcon.vue';
import Stock from '@library-management/common/entity/stock';

defineProps<{
  stock: Stock
}>()
const emit = defineEmits<{
  editNotes: [],
  deprecate: [],
  delete: [],
}>()

</script>

<template>
  <div class="actions-display">
    <a href="javascript:;" @click="emit('editNotes')"><v-icon icon="mdi-playlist-edit" /></a>
    <a href="javascript:;" @click="emit('deprecate')"><v-icon :icon="stock.deprecated ? 'mdi-arrow-up-circle-outline' : 'mdi-arrow-down-circle-outline'" /></a>
    <TwiceDeleteIcon @delete="emit('delete')" />
  </div>
</template>

<style scoped>
  .actions-display {
    display: flex;
    gap: 4px;
  }
</style>

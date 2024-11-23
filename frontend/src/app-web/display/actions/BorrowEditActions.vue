<script setup lang="ts">
import Borrow from '@library-management/common/entity/borrow';
import TwiceDeleteIcon from '../../component/TwiceDeleteIcon.vue';

defineProps<{
  borrow: Borrow
}>()
const emit = defineEmits<{
  editNotes: [],
  delete: [],
  emulate: []
}>()

</script>

<template>
  <div class="actions-display">
    <a href="javascript:;" @click="emit('editNotes')"><v-icon icon="mdi-playlist-edit" /></a>
    <a href="javascript:;" @click="emit('emulate')"><v-icon icon="mdi-alert-outline" /></a>
    <TwiceDeleteIcon @delete="emit('delete')" />
  </div>
</template>

<style scoped>
  .actions-display {
    display: flex;
    gap: 4px;
  }
</style>

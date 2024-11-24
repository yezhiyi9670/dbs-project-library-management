<script setup lang="ts">
import Title from '@library-management/common/entity/title';
import TwiceDeleteIcon from '../../component/TwiceDeleteIcon.vue';

defineProps<{
  title: Title
}>()
const emit = defineEmits<{
  edit: [],
  delete: [],
  seeStocks: [newTab: boolean],
  addStock: []
}>()

</script>

<template>
  <div class="actions-display">
    <a href="javascript:;" @click="emit('edit')"><v-icon icon="mdi-pencil" /></a>
    <TwiceDeleteIcon @delete="emit('delete')" />
    <template v-if="title.place || title.total">
      <a href="javascript:;" @click="emit('seeStocks', false)" @contextmenu.prevent="emit('seeStocks', true)"><v-icon icon="mdi-layers " /></a>
    </template>
    <template v-if="title.place">
      <a href="javascript:;" @click="emit('addStock')"><v-icon icon="mdi-layers-plus" /></a>
    </template>
  </div>
</template>

<style scoped>
  .actions-display {
    display: flex;
    gap: 8px;
  }
</style>

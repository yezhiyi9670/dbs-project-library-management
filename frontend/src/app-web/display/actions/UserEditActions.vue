<script setup lang="ts">
import TwiceDeleteIcon from '../../component/TwiceDeleteIcon.vue';
import User from '@library-management/common/entity/user';

defineProps<{
  user: User
}>()
const emit = defineEmits<{
  edit: [],
  disable: [],
  delete: [],
  seeBorrows: [newTab: boolean]
}>()

</script>

<template>
  <div class="actions-display">
    <a href="javascript:;" @click="emit('edit')"><v-icon icon="mdi-pencil" /></a>
    <a href="javascript:;" @click="emit('disable')"><v-icon :icon="!user.enabled ? 'mdi-arrow-up-circle-outline' : 'mdi-arrow-down-circle-outline'" /></a>
    <TwiceDeleteIcon @delete="emit('delete')" />
    <a href="javascript:;" @click="emit('seeBorrows', false)" @contextmenu.prevent="emit('seeBorrows', true)"><v-icon icon="mdi-invoice-outline" /></a>
  </div>
</template>

<style scoped>
  .actions-display {
    display: flex;
    gap: 8px;
  }
</style>

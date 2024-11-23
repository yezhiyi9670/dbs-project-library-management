<script setup lang="ts">
import Title from '@library-management/common/entity/title';
import { ref } from 'vue';

const emit = defineEmits<{
  delete: [],
}>()

const readyDelete = ref(false)
const timeoutValue = ref<NodeJS.Timeout | null>(null)

function handleClick() {
  if(!readyDelete.value) {
    readyDelete.value = true
    if(timeoutValue.value != null) {
      clearTimeout(timeoutValue.value)
      timeoutValue.value = null
    }
    timeoutValue.value = setTimeout(() => {
      readyDelete.value = false
    }, 1000)
  } else {
    emit('delete')
  }
}

</script>

<template>
  <a @click="handleClick" href="javascript:;"><v-icon :icon="readyDelete ? 'mdi-delete' : 'mdi-delete-outline'" /></a>
</template>

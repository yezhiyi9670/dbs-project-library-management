<script setup lang="ts">
import { computed, watchEffect, reactive, ref, useTemplateRef, effect, watch } from 'vue';
import { useAppContext } from '../../context/AppContext';
import { Api } from '../../api/Api';
import { useBorrowMachine } from '../../context/BorrowMachine';

const props = defineProps<{
  action: 'check' | 'borrow' | 'return'
}>()

const appContext = useAppContext()
const returnLink = computed(() => (
  appContext.value.isLoggedIn() ? '/device/terminal/dashboard' : '/device/terminal'
))

const actionLabel = computed(() => ({
  check: '检查图书状态',
  borrow: '借书 / 续借',
  return: '归还'
}[props.action]))

const fieldRef = useTemplateRef('barcode-scan-field')
function focusField() {
  fieldRef.value?.focus()
}

watch(fieldRef, () => {
  // watchEffect makes it impossible to switch to other fields
  focusField()
})

const barcode = ref('')

const { tasks, handleNewItem } = useBorrowMachine('borrow/')

function handleEnter() {
  if(!barcode.value) {
    return
  }
  handleNewItem(props.action, barcode.value)
  barcode.value = ''
}

</script>

<template>
  <div @click="focusField" class="manipulation-focus">
    <div class="action-label">{{ actionLabel }}</div>
    <div v-if="tasks.length > 0" class="count-label">{{ tasks.length }}</div>
    <div style="width: calc(100% - 64px); margin: 0 auto">
      <div @keydown.enter="handleEnter" style="margin-top: 80px">
        <v-text-field
          ref="barcode-scan-field"
          hide-details
          label="请扫描扉页上的藏书条码"
          v-model="barcode"
        />
      </div>
      <v-card style="margin-top: 16px; height: 356px; overflow-y: scroll">
        <div v-for="task in tasks" class="task-entry">
          <div class="task-line-1">
            <code>{{ task.barcode }}</code> <span v-if="task.bookTitle != null">《{{ task.bookTitle }}》</span>
          </div>
          <div class="task-line-2">
            <v-progress-circular v-if="task.success == null" size="20" indeterminate />
            <v-icon v-if="task.success == true" icon="mdi-check" />
            <v-icon v-if="task.success == false" icon="mdi-close" />
            &nbsp;<span v-if="task.msg">{{ task.msg }}</span>
          </div>
        </div>
      </v-card>
      <div style="margin-top: 16px">
        <v-btn variant="tonal" style="width: 100%" size="large" :to="returnLink">
          <v-icon icon="mdi-check" /> 结束
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .manipulation-focus {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .action-label {
    font-size: 20px;
    position: absolute;
    left: 32px;
    top: 32px;
  }
  .count-label {
    font-size: 20px;
    position: absolute;
    right: 32px;
    top: 32px;
  }
  .task-entry {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #C1B8CC;
  }
  .task-line-2 {
    opacity: 0.5;
  }
</style>

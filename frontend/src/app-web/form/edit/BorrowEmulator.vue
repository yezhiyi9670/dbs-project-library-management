<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import { StockValidation } from '@library-management/common/entity/stock/validation';
import Borrow from '@library-management/common/entity/borrow';
import { UserValidation } from '@library-management/common/entity/user/validation';
import { useBorrowMachine } from '../../../context/BorrowMachine';

const props = defineProps<{
  referenceEntry: Borrow | null
}>()
const appContext = useAppContext()
const emit = defineEmits<{
  close: [next: boolean]
}>()

const valid = ref(false)

const username = ref(props.referenceEntry?.username ?? '')
const action = ref<'borrow' | 'return'>((props.referenceEntry && !props.referenceEntry.returned) ? 'return' : 'borrow')
const barcode = ref(props.referenceEntry?.barcode ?? '')

const usernameField = useTemplateRef('username-field')
const barcodeField = useTemplateRef('barcode-field')

const { tasks, handleNewItem } = useBorrowMachine('borrow/manage/')

function initFocus() {
  if(props.referenceEntry) {
    barcodeField.value?.focus()
  } else {
    usernameField.value?.focus()
  }
}

watch([barcodeField, usernameField], () => {
  initFocus()
})

watch(action, () => {
  tasks.value = []
})

function handleSubmit() {
  if(!barcode.value) {
    return
  }
  handleNewItem(action.value, barcode.value, { username: username.value })
  barcode.value = ''
}

</script>
<template>
  
  <v-card title="自助借阅模拟器">
    <div>
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <v-form v-model="valid">
          <v-row>
            <v-col :cols="6">
              <v-text-field
                ref="username-field"
                v-model="username"
                label="用户名"
                :rules="Api.validationRules([UserValidation.validateUsername_])"
                required
              />
            </v-col>
            <v-col :cols="6">
              <v-select
                v-model="action"
                label="操作类型"
                :rules="Api.validationRules([UserValidation.validateUsername_])"
                :items="[
                  {value: 'borrow', title: '借书 / 续借'},
                  {value: 'return', title: '还书'}
                ]"
                required
              />
            </v-col>
          </v-row>
          <v-divider class="mb-4" />
          <div @keydown.enter.prevent="() => handleSubmit()">
            <v-text-field
              ref="barcode-field"
              v-model="barcode"
              label="藏书条码（按 Enter 确定）"
              required
            />
          </div>
          <v-card variant="tonal" class="mb-4" style="height: 200px; overflow-y: scroll">
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
        </v-form>
        <v-btn
          color="secondary"
          text="关闭"
          @click="emit('close', false)"
        ></v-btn>
      </v-card-text>
    </div>
  </v-card>
</template>

<style scoped>
  .task-entry {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #C1B8CC;
  }
  .task-line-2 {
    opacity: 0.5;
  }
</style>

<script setup lang="ts">
import { computed, effect, reactive, ref, useTemplateRef } from 'vue';
import { useAppContext } from '../../context/AppContext';
import ReturnButton from '../component/ReturnButton.vue';
import { Api } from '../../api/Api';

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
effect(() => {
  fieldRef.value?.focus()
})

type TaskItem = {
  barcode: string,
  bookTitle: string | null,
  success: boolean | null,
  msg: string | null
}
const barcode = ref('')
const tasks = ref<TaskItem[]>([])

function handleEnter() {
  if(!barcode.value) {
    return
  }
  handleNewItem(barcode.value)
  barcode.value = ''
}
async function handleNewItem(barcode: string) {
  if(tasks.value.filter(item => item.barcode == barcode).length > 0) {
    appContext.value.showToast('这本书已经扫描过，请勿重复扫描')
    return
  }
  const secret = (window as any).__library_terminal_secret ?? ''
  const entry: TaskItem = {
    barcode: barcode,
    bookTitle: null,
    success: null,
    msg: null
  }
  let is_renew = false
  tasks.value = [ entry, ...tasks.value ]
  let result = await appContext.value.post({
    check: 'borrow/check',
    borrow: 'borrow/borrow',
    return: 'borrow/return'
  }[props.action], { barcode, __secret: secret })
  if(props.action == 'borrow' && !result.success && result.data.code == 'already_borrowed') {
    result = await appContext.value.post('borrow/renew', {
      barcode, __secret: secret
    }) // Already borrowed, try to renew
    is_renew = true
  }
  if(result.success) {
    entry.bookTitle = result.data.$stock.$title.title
    if(props.action == 'check') {
      if(result.data.deprecated) {
        entry.msg = '此书将淘汰，不可借阅'
        entry.success = false
      } else {
        entry.success = true
        if(result.data.borrowed) {
          let msg = ''
          if(result.data.borrowed_by_you) {
            msg += '此书正在被你借阅'
          } else {
            msg += appContext.value.isLoggedIn() ? '此书正在被其他人借阅' : '此书正在被借阅'
          }
          msg += '，截止时间 ' + new Date(result.data.borrowed_due * 1000).toLocaleString()
          entry.msg = msg
        } else {
          entry.msg = '此书现在可以借阅'
        }
      }
    } else if(props.action == 'borrow') {
      entry.success = true
      entry.msg = (is_renew ? '续借成功' : '借阅成功') + '，请在 ' + new Date(result.data.due_time * 1000).toLocaleString() + ' 前归还'
    } else if(props.action == 'return') {
      entry.success = true
      entry.msg = '归还成功' + (result.data.return_time > result.data.due_time ? '，已逾期' : '')
    }
    tasks.value = [...tasks.value]
  } else {
    tasks.value = tasks.value.filter(item => item.barcode != barcode)
    appContext.value.showToast(Api.errorMessage(result.data))
  }
}

</script>

<template>
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
          <v-icon v-if="task.success == null" icon="mdi-timer-sand" />
          <v-icon v-if="task.success == true" icon="mdi-check" />
          <v-icon v-if="task.success == false" icon="mdi-close" />
          &nbsp;<span v-if="task.msg">{{ task.msg }}</span>
        </div>
      </div>
    </v-card>
    <div style="margin-top: 16px">
      <v-btn variant="tonal" style="width: 100%" size="large" :to="returnLink">
        <v-icon icon="mdi-check" /> 完成
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
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

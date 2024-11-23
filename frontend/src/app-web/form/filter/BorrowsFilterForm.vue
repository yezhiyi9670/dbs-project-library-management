<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import { FilterTyping } from '@library-management/common/typing/FilterTyping'
import { Api } from '../../../api/Api';
import { BorrowValidation } from '@library-management/common/entity/borrow/validation'
import { TitleValidation } from '@library-management/common/entity/title/validation';
import { useAppContext } from '../../../context/AppContext';
import { borrows__filter_username, borrows__historical, borrows__overdue } from '../../intent/intents';
import { RandomToken } from '@library-management/common/crypto/RandomToken';

const props = defineProps<{
  loading: boolean,
  showAllByDefault?: boolean,
  canEmulate?: boolean
}>()
const emit = defineEmits<{
  change: [conditions: Object],
  emulate: []
}>()

const dirty = ref(false)

export type BorrowReturned = false | true
export type BorrowOverdue = false | true

const appContext = useAppContext()

const intent = appContext.value.getIntent()
const returnedDefault: BorrowReturned[] = (intent == borrows__historical || intent == borrows__overdue || props.showAllByDefault) ? [] : [false]
const overdueDefault: BorrowOverdue[] = intent == borrows__overdue ? [true] : []
let initialUsername = ''
if(Array.isArray(intent) && intent[0] == borrows__filter_username) {
  initialUsername = intent[1]
}

const seq = ref<string>('')

const book_number = ref<string>('')
const barcode = ref<string>('')
const username = ref<string>(initialUsername)
const returned = ref<BorrowReturned[]>(returnedDefault)
const overdue = ref<BorrowOverdue[]>(overdueDefault)

const conditions = computed(() => ({
  __seq: seq.value,
  book_numbers: FilterTyping.toStringSingular(book_number.value),
  barcodes: FilterTyping.toStringSingular(barcode.value),
  users: FilterTyping.toStringSingular(username.value),
  returned: FilterTyping.toSet(returned.value),
  overdue: FilterTyping.toSet(overdue.value)
}))

watch(conditions, () => {
  dirty.value = true
})

function refresh() {
  if(!dirty.value) {
    seq.value = RandomToken.alphanum(24)
  }
  nextTick(updateFilters)
}
function updateFilters() {
  if(!dirty.value) return
  dirty.value = false
  emit('change', conditions.value)
}

const colSpec = { cols: 12, sm: 6, md: 4 }

emit('change', conditions.value)

</script>

<template>
  
  <v-card class="pa-4">
    <div @keydown.enter="updateFilters">
      <v-form>
        <v-row dense>
          <v-col :="colSpec">
            <v-text-field
              v-model="book_number"
              density="compact"
              :rules="Api.validationRules([TitleValidation.validateBookNumber_])"
              hide-details
              label="书号（精准匹配）"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              v-model="barcode"
              density="compact"
              hide-details
              label="藏书条码（精准匹配）"
              :rules="Api.validationRules([BorrowValidation.validateBarcode_])"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              v-model="username"
              density="compact"
              hide-details
              label="用户名（精准匹配）"
              :rules="Api.validationRules([BorrowValidation.validateBarcode_])"
            />
          </v-col>
          <v-col :="colSpec">
            <v-select
              label="状态（析取）"
              density="compact"
              v-model="returned"
              hide-details
              multiple
              :items="[
                {value: false, title: '活跃'},
                {value: true, title: '已归还'}
              ]"
            />
          </v-col>
          <v-col :="colSpec">
            <v-select
              label="逾期（析取）"
              density="compact"
              v-model="overdue"
              hide-details
              multiple
              :items="[
                {value: false, title: '正常'},
                {value: true, title: '已逾期'},
              ]"
            />
          </v-col>
          <v-col :="colSpec">
            <v-btn :disabled="loading" :loading="loading" :color="dirty ? 'primary' : 'tertiary'" @click="refresh">
              {{ dirty ? '更新筛选' : '刷新查询' }}
            </v-btn>
            <v-btn @click="emit('emulate')" v-if="canEmulate" class="ml-2">
              <v-icon icon="mdi-alert-outline" /> 模拟借书操作
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-card>

</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import { FilterTyping } from '@library-management/common/typing/FilterTyping'
import { RandomToken } from '@library-management/common/crypto/RandomToken';
import { useAppContext } from '../../../context/AppContext';
import { stocks__filter_barcode, stocks__filter_book_number, stocks__to_deprecate } from '../../intent/intents';

const appContext = useAppContext()
const intent = appContext.value.getIntent()

let barcode_prefix_init = ''
let book_number_init = ''
let deprecated_init: boolean[] = []
if(Array.isArray(intent) && intent[0] == stocks__filter_book_number) {
  book_number_init = intent[1]
}
if(Array.isArray(intent) && intent[0] == stocks__filter_barcode) {
  barcode_prefix_init = intent[1]
}
if(intent == stocks__to_deprecate) {
  deprecated_init = [true]
}

const props = defineProps<{
  loading: boolean,
  canAdd?: boolean
}>()
const emit = defineEmits<{
  change: [conditions: Object],
  add: []
}>()

const dirty = ref(false)

const seq = ref<string>('')
const book_number = ref<string>(book_number_init)
const barcode_prefix = ref<string>(barcode_prefix_init)
const deprecated = ref<boolean[]>(deprecated_init)
const borrowed = ref<('none' | 'normal' | 'overdue')[]>([])

const conditions = computed(() => ({
  __seq: seq.value,
  book_number: FilterTyping.toString(book_number.value),
  barcode_prefix: FilterTyping.toString(barcode_prefix.value),
  deprecated: FilterTyping.toSet(deprecated.value),
  borrowed: FilterTyping.toSet(borrowed.value),
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
    <div @keydown.enter.prevent="updateFilters">
      <v-form>
        <v-row dense>
          <v-col :="colSpec">
            <v-text-field
              v-model="book_number"
              density="compact"
              hide-details
              label="书号（精准匹配）"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              v-model="barcode_prefix"
              density="compact"
              hide-details
              label="藏书条码（前缀）"
            />
          </v-col>
          <v-col :="colSpec">
            <v-select
              label="即将淘汰（析取）"
              density="compact"
              v-model="deprecated"
              hide-details
              multiple
              :items="[
                {value: false, title: '否'},
                {value: true, title: '是'}
              ]"
            />
          </v-col>
          <v-col :="colSpec">
            <v-select
              label="借阅状态（析取）"
              density="compact"
              v-model="borrowed"
              hide-details
              multiple
              :items="[
                {value: 'none', title: '未被借阅'},
                {value: 'normal', title: '在期限内'},
                {value: 'overdue', title: '已逾期'}
              ]"
            />
          </v-col>
          <v-col :="colSpec">
            <v-btn :disabled="loading" :loading="loading" :color="dirty ? 'primary' : 'tertiary'" @click="refresh">
              {{ dirty ? '更新筛选' : '刷新查询' }}
            </v-btn>
            <v-btn @click="emit('add')" v-if="canAdd" class="ml-2">
              <v-icon icon="mdi-plus" /> 添加藏书
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-card>

</template>

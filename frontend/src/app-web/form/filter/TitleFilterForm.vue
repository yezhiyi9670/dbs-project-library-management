<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import { FilterTyping } from '@library-management/common/typing/FilterTyping'
import { RandomToken } from '@library-management/common/crypto/RandomToken';
import { useAppContext } from '../../../context/AppContext';
import { titles__filter_book_number } from '../../intent/intents';

const props = defineProps<{
  loading: boolean,
  canAdd?: boolean
}>()
const emit = defineEmits<{
  change: [conditions: Object],
  add: []
}>()

const appContext = useAppContext()
const intent = appContext.value.getIntent()

let book_number_init = ''
if(Array.isArray(intent) && intent[0] == titles__filter_book_number) {
  book_number_init = intent[1]
}

const dirty = ref(false)

export type TitleAccessible = 'offline' | 'online'
export type TitleStatus = 'borrowable' | 'borrowed' | 'unavailable' | 'empty'

const seq = ref<string>('')
const book_number = ref<string>(book_number_init)
const barcode = ref<string>('')
const title = ref<string>('')
const author = ref<string>('')
const publisher = ref<string>('')
const accessible = ref<TitleAccessible[]>([])
const status = ref<TitleStatus[]>([])
const year_min = ref<string>('')
const year_max = ref<string>('')

const conditions = computed(() => ({
  __seq: seq.value,
  book_number: FilterTyping.toString(book_number.value),
  barcode: FilterTyping.toString(barcode.value),
  title: FilterTyping.toString(title.value),
  author: FilterTyping.toString(author.value),
  publisher: FilterTyping.toString(publisher.value),
  accessible: FilterTyping.toSet(accessible.value),
  status: FilterTyping.toSet(status.value),
  year_min: FilterTyping.toNumber(year_min.value),
  year_max: FilterTyping.toNumber(year_max.value)
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
              v-model="barcode"
              density="compact"
              hide-details
              label="藏书条码（精准匹配）"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              v-model="title"
              density="compact"
              hide-details
              label="书名"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              v-model="author"
              density="compact"
              hide-details
              label="作者"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              v-model="publisher"
              density="compact"
              hide-details
              label="出版社"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              type="number"
              v-model="year_min"
              density="compact"
              hide-details
              label="最小年份"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              type="number"
              v-model="year_max"
              density="compact"
              hide-details
              label="最大年份"
            />
          </v-col>
          <v-col :="colSpec">
            <v-select
              label="可访问方式（合取）"
              density="compact"
              v-model="accessible"
              hide-details
              multiple
              :items="[
                {value: 'offline', title: '线下物理书籍'},
                {value: 'online', title: '在线阅读'}
              ]"
            />
          </v-col>
          <v-col :="colSpec">
            <v-select
              label="物理藏书状态（析取）"
              density="compact"
              v-model="status"
              hide-details
              multiple
              :items="[
                {value: 'borrowable', title: '可借阅'},
                {value: 'borrowed', title: '已全部被借走'},
                {value: 'unavailable', title: '即将淘汰'},
                {value: 'empty', title: '无藏书'}
              ]"
            />
          </v-col>
          <v-col :="colSpec">
            <v-btn :disabled="loading" :loading="loading" :color="dirty ? 'primary' : 'tertiary'" @click="refresh">
              {{ dirty ? '更新筛选' : '刷新查询' }}
            </v-btn>
            <v-btn @click="emit('add')" v-if="canAdd" class="ml-2">
              <v-icon icon="mdi-plus" /> 新建书目
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-card>

</template>

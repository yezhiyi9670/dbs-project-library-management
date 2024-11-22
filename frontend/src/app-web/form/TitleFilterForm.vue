<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import { FilterTyping } from '@library-management/common/typing/FilterTyping'
import { RandomToken } from '@library-management/common/crypto/RandomToken';

const emit = defineEmits<{
  change: [conditions: Object]
}>()

const dirty = ref(false)

export type TitleAccessible = 'offline' | 'online'
export type TitleStatus = 'borrowable' | 'borrowed' | 'unavailable' | 'empty'

const seq = ref<string>('')
const book_number = ref<string>('')
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
    <div @keydown.enter="updateFilters">
      <v-form>
        <v-row dense>
          <v-col :="colSpec">
            <v-text-field
              v-model="book_number"
              density="compact"
              hide-details
              label="书号"
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
              label="可访问方式 (and)"
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
              label="物理藏书状态 (or)"
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
            <v-btn :color="dirty ? 'primary' : 'secondary'" @click="refresh">
              {{ dirty ? '更新筛选条件' : '刷新查询' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-card>

</template>

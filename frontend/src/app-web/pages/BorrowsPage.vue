<script setup lang="ts">
import { ref, Ref, watchEffect } from 'vue';
import PermissionGuard from '../component/PermissionGuard.vue';
import BorrowsFilterForm from '../form/BorrowsFilterForm.vue';
import Borrow from '@library-management/common/entity/borrow'
import { useAppContext } from '../../context/AppContext';
import { Api } from '../../api/Api';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import TimeDisplay from '../display/TimeDisplay.vue';

const appContext = useAppContext()
const conditions = ref<Object | null>(null)

const serverItems: Ref<Borrow[]> = ref([])
const loading = ref(true)
const totalItems = ref(0)

const sortBy = ref<any>([{key: 'borrow_time', order: 'desc'}])
const itemsPerPage = ref(10)
const page = ref(1)

watchEffect(async () => {
  if(conditions.value == null) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('borrow/my', {
    ...conditions.value,
    pn: page.value, rn: itemsPerPage.value,
    ...(sortBy.value[0] && { sort_by: sortBy.value[0].key, sort_dir: sortBy.value[0].order })
  })
  loading.value = false

  if(result.success) {
    totalItems.value = result.data.count
    serverItems.value = result.data.window.map((item: Object) => EntityUtils.fromDict(new Borrow(), item))
  } else {
    totalItems.value = 0
    serverItems.value = []
    appContext.value.showToast('查询失败：' + Api.errorMessage(result.data))
  }
})
</script>

<template>
  <PermissionGuard>
    <v-container>
      <BorrowsFilterForm @change="v => conditions = v" />

      <v-card class="mt-4">
        <v-data-table-server
          :headers="[
            {key: '__.title', title: '书目', minWidth: '160px'},
            {key: 'barcode', title: '藏书条码', minWidth: '160px'},
            {key: 'borrow_time', title: '借出时间', minWidth: '160px'},
            {key: 'due_time', title: '截止时间', minWidth: '160px'},
            {key: 'return_time', title: '归还时间', minWidth: '160px'},
            {key: '__.price_milliunit', title: '价格', minWidth: '90px'},
          ]"
          v-model:sort-by="sortBy"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
        >
          <template v-slot:item.__.title="{ item }">
            <RouterLink target="_blank" :to="'/book-details/' + item.$stock?.$title?.book_number">{{ item.$stock?.$title?.title }}</RouterLink>
          </template>
          <template v-slot:item.__.price_milliunit="{ item }">
            {{ (item.$stock!.$title!.price_milliunit / 1000).toFixed(2) }}
          </template>
          <template v-slot:item.borrow_time="{ item }">
            <TimeDisplay :timestamp="item.borrow_time" />
          </template>
          <template v-slot:item.due_time="{ item }">
            <TimeDisplay :timestamp="item.due_time" :overdue="item.returned ? item.return_time > item.due_time : (+new Date()) / 1000 > item.due_time" />
          </template>
          <template v-slot:item.return_time="{ item }">
            <TimeDisplay v-if="item.returned" :timestamp="item.return_time" />
            <template v-else>未归还</template>
          </template>
        </v-data-table-server>
      </v-card>

      <div class="mt-4">
        图书借阅、续借与归还请使用图书馆中的自助终端。
      </div>
    </v-container>

  </PermissionGuard>
</template>

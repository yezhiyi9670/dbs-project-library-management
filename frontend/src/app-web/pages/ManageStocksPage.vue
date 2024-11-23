<script setup lang="ts">
import { nextTick, Ref, ref, watch, watchEffect } from 'vue';
import { useAppContext } from '../../context/AppContext';
import { Api } from '../../api/Api';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import TitleViewAction from '../display/actions/TitleViewAction.vue';
import { RandomToken } from '@library-management/common/crypto/RandomToken';
import StockEnrollForm from '../form/edit/StockEnrollForm.vue';
import Stock from '@library-management/common/entity/stock';
import StockFilterForm from '../form/filter/StockFilterForm.vue';
import StockEditActions from '../display/actions/StockEditActions.vue';
import StockEditForm from '../form/edit/StockEditForm.vue';
import BookNumberLink from '../display/link/BookNumberLink.vue';
import UsernameLink from '../display/link/UsernameLink.vue';
import PermissionGuard from '../component/PermissionGuard.vue';

const appContext = useAppContext()
const conditions = ref<Object | null>(null)
const originalEntry = ref<Stock | null>(null)

const serverItems: Ref<Stock[]> = ref([])
const loading = ref(true)
const totalItems = ref(0)

const sortBy = ref<any>([])
const itemsPerPage = ref(10)
const page = ref(1)

async function reload() {
  if(conditions.value == null) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('stock/manage/list', {
    ...conditions.value,
    pn: page.value, rn: itemsPerPage.value,
    ...(sortBy.value[0] && { sort_by: sortBy.value[0].key, sort_dir: sortBy.value[0].order })
  })
  loading.value = false
  if(result.success) {
    totalItems.value = result.data.count
    serverItems.value = result.data.window.map((item: Object) => EntityUtils.fromDict(new Stock(), item))
  } else {
    totalItems.value = 0
    serverItems.value = []
    appContext.value.showToast('查询失败：' + Api.errorMessage(result.data))
  }
}

watchEffect(reload)

const enroll_decrease_to_purchase = ref(false)
const enrollFormToken = ref('')
const enrollFormOpen = ref(false)
function handleEnroll() {
  enrollFormOpen.value = true
}
function handleEnrollFinish(next: boolean) {
  if(next) {
    enrollFormToken.value = RandomToken.alphanum(24)
  } else {
    enrollFormOpen.value = false
  }
}

const editFormOpen = ref(false)
function handleEdit(item: Stock | null) {
  originalEntry.value = item
  editFormOpen.value = true
}
function handleEditFinish() {
  editFormOpen.value = false
}

// reload on window close
watchEffect(async () => {
  if(!editFormOpen.value && !enrollFormOpen.value) {
    await reload()
  }
})

async function handleDelete(item: Stock) {
  const result = await appContext.value.post('stock/manage/delete', {
    barcode: item.barcode
  })
  if(result.success) {
    appContext.value.showToast('删除成功')
    await reload()
  } else {
    appContext.value.showToast('删除失败：' + Api.errorMessage(result.data))
  }
}
async function handleToggle(item: Stock) {
  if(item.deprecated) {
    const result = await appContext.value.post('stock/manage/revive', {
      barcode: item.barcode
    })
    if(result.success) {
      appContext.value.showToast('成功取消待淘汰标记')
      await reload()
    } else {
      appContext.value.showToast('标记失败：' + Api.errorMessage(result.data))
    }
  } else {
    const result = await appContext.value.post('stock/manage/deprecate', {
      barcode: item.barcode
    })
    if(result.success) {
      appContext.value.showToast('成功标记为待淘汰')
      await reload()
    } else {
      appContext.value.showToast('标记失败：' + Api.errorMessage(result.data))
    }
  }
}

</script>

<template>
  <PermissionGuard require-book-admin>
    <v-dialog v-model="editFormOpen" max-width="500">
      <StockEditForm @close="handleEditFinish" :entry="originalEntry" />
    </v-dialog>
    <v-dialog v-model="enrollFormOpen" max-width="500">
      <StockEnrollForm
        v-model:decrease_to_purchase="enroll_decrease_to_purchase"
        :key="enrollFormToken"
        @close="handleEnrollFinish"
        :book_number="null"
      />
    </v-dialog>

    <v-container>
      <StockFilterForm @add="handleEnroll()" :loading="loading" @change="v => conditions = v" can-add />

      <v-card class="mt-4">
        <v-data-table-server
          :headers="[
            {key: 'barcode', title: '藏书条码'},
            {key: 'book_number', title: '书号'},
            {key: '__.title', title: '书名'},
            {key: 'borrowed_by', title: '借阅者'},
            {key: 'borrowed_due', title: '借阅期限'},
            {key: 'deprecated', title: '待淘汰'},
            {key: 'stock_notes', title: '注记'},
            {key: '__actions', title: '操作', sortable: false},
          ]"
          v-model:sort-by="sortBy"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
        >
          <template v-slot:item.__.title="{ item }">
            <TitleViewAction :title="item.$title!" />
          </template>
          <template v-slot:item.book_number="{ item }">
            <BookNumberLink :book_number="item.book_number" />
          </template>
          <template v-slot:item.borrowed_by="{ item }">
            <UsernameLink v-if="item.borrowed" :username="item.borrowed_by" />
          </template>
          <template v-slot:item.borrowed_due="{ item }">
            {{ item.borrowed ? (new Date(item.borrowed_due * 1000).toLocaleString()) : '未借阅' }}
          </template>
          <template v-slot:item.deprecated="{ item }">
            {{ item.deprecated ? '是' : '' }}
          </template>
          <template v-slot:item.__actions="{ item }">
            <StockEditActions
              :key="item.barcode"
              @delete="handleDelete(item)"
              @deprecate="handleToggle(item)"
              @edit-notes="handleEdit(item)"
              :stock="item"
            />
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>
  </PermissionGuard>
</template>

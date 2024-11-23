<script setup lang="ts">
import { ref, Ref, watchEffect } from 'vue';
import PermissionGuard from '../component/PermissionGuard.vue';
import BorrowsFilterForm from '../form/filter/BorrowsFilterForm.vue';
import Borrow from '@library-management/common/entity/borrow'
import { useAppContext } from '../../context/AppContext';
import { Api } from '../../api/Api';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import TimeDisplay from '../display/display/TimeDisplay.vue';
import TitleViewAction from '../display/actions/TitleViewAction.vue';
import StockBarcodeLink from '../display/link/StockBarcodeLink.vue';
import UsernameLink from '../display/link/UsernameLink.vue';
import BorrowEditActions from '../display/actions/BorrowEditActions.vue';
import BorrowEditForm from '../form/edit/BorrowEditForm.vue';
import BorrowEmulator from '../form/edit/BorrowEmulator.vue';

const appContext = useAppContext()
const conditions = ref<Object | null>(null)
const originalEntry = ref<Borrow | null>(null)

const serverItems: Ref<Borrow[]> = ref([])
const loading = ref(true)
const totalItems = ref(0)

const sortBy = ref<any>([{key: 'borrow_time', order: 'desc'}])
const itemsPerPage = ref(10)
const page = ref(1)

async function reload() {
  if(conditions.value == null) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('borrow/manage/list', {
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
}

watchEffect(reload)

async function handleDelete(item: Borrow) {
  const result = await appContext.value.post('borrow/manage/delete', {
    uuid: item.uuid
  })
  if(result.success) {
    appContext.value.showToast('删除成功')
    await reload()
  } else {
    appContext.value.showToast('删除失败：' + Api.errorMessage(result.data))
  }
}

const editFormOpen = ref(false)
function handleEdit(item: Borrow | null) {
  originalEntry.value = item
  editFormOpen.value = true
}
function handleEditFinish() {
  editFormOpen.value = false
}

const emulatorOpen = ref(false)
function handleEmulate(item: Borrow | null) {
  originalEntry.value = item
  emulatorOpen.value = true
}
function handleEmulateFinish() {
  emulatorOpen.value = false
}

// reload on window close
watchEffect(async () => {
  if(!editFormOpen.value && !emulatorOpen.value) {
    await reload()
  }
})

</script>

<template>
  <PermissionGuard require-book-admin>
    <v-dialog v-model="editFormOpen" max-width="500">
      <BorrowEditForm @close="handleEditFinish" :entry="originalEntry" />
    </v-dialog>
    <v-dialog v-model="emulatorOpen" max-width="800">
      <BorrowEmulator @close="handleEmulateFinish" :reference-entry="originalEntry" />
    </v-dialog>

    <v-container>
      <BorrowsFilterForm @emulate="handleEmulate(null)" show-all-by-default can-emulate :loading="loading" @change="v => conditions = v" />

      <v-card class="mt-4">
        <v-data-table-server
          :headers="[
            {key: '__.title', title: '书目'},
            {key: 'username', title: '用户名'},
            {key: 'barcode', title: '藏书条码'},
            {key: 'borrow_time', title: '借出时间'},
            {key: 'due_time', title: '截止时间'},
            {key: 'return_time', title: '归还时间'},
            {key: 'borrow_notes', title: '注记'},
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
            <TitleViewAction :title="item.$stock!.$title!" />
          </template>
          <template v-slot:item.barcode="{ item }">
            <StockBarcodeLink :barcode="item.barcode" />
          </template>
          <template v-slot:item.username="{ item }">
            <UsernameLink :username="item.username" />
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
          <template v-slot:item.__actions="{ item }">
            <BorrowEditActions
              :key="item.uuid"
              :borrow="item"
              @delete="handleDelete(item)"
              @emulate="handleEmulate(item)"
              @edit-notes="handleEdit(item)"
            />
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>

  </PermissionGuard>
</template>

<script setup lang="ts">
import { nextTick, Ref, ref, watch, watchEffect } from 'vue';
import TitleFilterForm from '../form/filter/TitleFilterForm.vue';
import { useAppContext } from '../../context/AppContext';
import { Api } from '../../api/Api';
import Title from '@library-management/common/entity/title'
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import TitleViewAction from '../display/actions/TitleViewAction.vue';
import TitleEditActions from '../display/actions/TitleEditActions.vue';
import TitleEditForm from '../form/edit/TitleEditForm.vue';
import { RandomToken } from '@library-management/common/crypto/RandomToken';
import StockEnrollForm from '../form/edit/StockEnrollForm.vue';
import { useRoute, useRouter } from 'vue-router';
import { stocks__filter_book_number, titles__to_purchase } from '../intent/intents';
import PermissionGuard from '../component/PermissionGuard.vue';

const appContext = useAppContext()
const intent = appContext.value.getIntent()
const do_filter_to_purchase = intent == titles__to_purchase
if(!do_filter_to_purchase) {
  appContext.value.putIntent(intent)  // It still need to be passed to the filter form
}

const router = useRouter()
const conditions = ref<Object | null>(null)
const originalEntry = ref<Title | null>(null)

const serverItems: Ref<Title[]> = ref([])
const loading = ref(true)
const totalItems = ref(0)

const sortBy = ref<any>(do_filter_to_purchase ? [{ key: 'to_purchase_amount', order: 'desc' }] : [])
const itemsPerPage = ref(10)
const page = ref(1)

async function reload() {
  if(conditions.value == null) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('title/list', {
    ...conditions.value,
    pn: page.value, rn: itemsPerPage.value,
    ...(sortBy.value[0] && { sort_by: sortBy.value[0].key, sort_dir: sortBy.value[0].order })
  })
  loading.value = false
  if(result.success) {
    totalItems.value = result.data.count
    serverItems.value = result.data.window.map((item: Object) => EntityUtils.fromDict(Title.withDerivatives(), item))
  } else {
    totalItems.value = 0
    serverItems.value = []
    appContext.value.showToast('查询失败：' + Api.errorMessage(result.data))
  }
}

watchEffect(reload)

const enroll_decrease_to_purchase = ref(true)
const enrollFormToken = ref('')
const enrollFormOpen = ref(false)
function handleEnroll(item: Title | null) {
  originalEntry.value = item
  enrollFormOpen.value = true
}
function handleEnrollFinish(next: boolean) {
  if(next) {
    enrollFormToken.value = RandomToken.alphanum(24)
  } else {
    enrollFormOpen.value = false
  }
}

const editFormToken = ref('')
const editFormOpen = ref(false)
function handleEdit(item: Title | null) {
  originalEntry.value = item
  editFormOpen.value = true
}
function handleEditFinish(next: boolean) {
  if(next) {
    editFormToken.value = RandomToken.alphanum(24)
    originalEntry.value = null
  } else {
    editFormOpen.value = false
  }
}

// reload on window close
watchEffect(async () => {
  if(!editFormOpen.value && !enrollFormOpen.value) {
    await reload()
  }
})

async function handleDelete(item: Title) {
  const result = await appContext.value.post('title/manage/delete', {
    old_book_number: item.book_number
  })
  if(result.success) {
    appContext.value.showToast('删除成功')
    await reload()
  } else {
    appContext.value.showToast('删除失败：' + Api.errorMessage(result.data))
  }
}

function handleSeeStock(item: Title, isNewTab: boolean) {
  appContext.value.putIntent([ stocks__filter_book_number, item.book_number ])
  if(isNewTab) {
    window.open('#/manage/stocks')
  } else {
    router.push('/manage/stocks')
  }
}
</script>

<template>
  <PermissionGuard require-book-admin>

    <v-dialog v-model="editFormOpen" max-width="1200">
      <TitleEditForm :key="editFormToken" @close="handleEditFinish" :original="originalEntry" />
    </v-dialog>
    <v-dialog v-model="enrollFormOpen" max-width="500">
      <StockEnrollForm
        v-model:decrease_to_purchase="enroll_decrease_to_purchase"
        :key="enrollFormToken"
        @close="handleEnrollFinish"
        :book_number="originalEntry?.book_number"
      />
    </v-dialog>

    <v-container>
      <TitleFilterForm @add="handleEdit(null)" :loading="loading" @change="v => conditions = v" can-add />

      <v-card class="mt-4">
        <v-data-table-server
          :headers="[
            {key: 'book_number', title: '书号'},
            {key: 'title', title: '书名'},
            {key: 'publisher', title: '出版社'},
            {key: 'year', title: '年份'},
            {key: 'total', title: '数量'},
            {key: 'to_purchase_amount', title: '待采购'},
            {key: 'deprecated', title: '待淘汰'},
            {key: 'description', title: '描述', sortable: false},
            {key: '__actions', title: '操作', sortable: false},
          ]"
          v-model:sort-by="sortBy"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
        >
          <template v-slot:item.title="{ item }">
            <TitleViewAction :title="item" />
          </template>
          <template v-slot:item.to_purchase_amount="{ item }">
            {{ item.to_purchase_amount }} ({{ (item.to_purchase_amount * item.price_milliunit / 1000).toFixed(2) }})
          </template>
          <template v-slot:item.total="{ item }">
            {{
              item.total - item.deprecated - item.borrowed + item.deprecated_and_borrowed
            }}/{{
              item.total - item.deprecated
            }}
          </template>
          <template v-slot:item.description="{ item }">
            {{ item.description.length }}
          </template>
          <template v-slot:item.__actions="{ item }">
            <TitleEditActions
              :key="item.book_number"
              @edit="handleEdit(item)"
              @delete="handleDelete(item)"
              @add-stock="handleEnroll(item)"
              @see-stocks="isNewTab => handleSeeStock(item, isNewTab)"
              :title="item"
            />
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>

  </PermissionGuard>
</template>

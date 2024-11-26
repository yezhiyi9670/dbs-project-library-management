<script setup lang="ts">
import { Ref, ref, watch, watchEffect } from 'vue';
import TitleFilterForm from '../form/filter/TitleFilterForm.vue';
import { useAppContext } from '../../context/AppContext';
import { Api } from '../../api/Api';
import Title from '@library-management/common/entity/title'
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import TitleAccessibleDisplay from '../display/display/TitleAccessibleDisplay.vue';
import TitleViewAction from '../display/actions/TitleViewAction.vue';

const appContext = useAppContext()
const conditions = ref<Object | null>(null)

const serverItems: Ref<Title[]> = ref([])
const loading = ref(true)
const totalItems = ref(0)

const sortBy = ref<any>([])
const itemsPerPage = ref(10)
const page = ref(1)

watchEffect(async () => {
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
})
</script>

<template>
  <v-container>
    <TitleFilterForm :loading="loading" @change="v => conditions = v" />

    <v-card class="mt-4">
      <v-data-table-server
        :headers="[
          {key: 'book_number', title: '书号'},
          {key: 'title', title: '书名'},
          {key: 'author', title: '作者'},
          {key: 'publisher', title: '出版社'},
          {key: 'year', title: '年份'},
          {key: '__borrowables', title: '可借数量', sortable: false},
          {key: '__accessible', title: '访问方式', sortable: false},
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
        <template v-slot:item.__borrowables="{ item }">
          {{
            item.normal_and_unborrowed()
          }}/{{
            item.normal()
          }}
        </template>
        <template v-slot:item.__accessible="{ item }">
          <TitleAccessibleDisplay :title="item" />
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

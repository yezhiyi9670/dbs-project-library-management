<script setup lang="ts">
import { computed, effect, ref } from 'vue';
import { useAppContext } from '../../context/AppContext';
import { useRoute } from 'vue-router';
import { Api } from '../../api/Api';
import Title from '@library-management/common/entity/title';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import FullscreenError from '../error-pages/FullscreenError.vue';
import StatDisplay, { StatEntry } from '../component/StatDisplay.vue';
import { LIBRARY_NAME } from '../../branding/titles';

const appContext = useAppContext()

const entryInfo = ref<Title | null>(null)
const loading = ref<'loading' | 'success' | 'error'>('loading')
const route = useRoute()

effect(async () => {
  loading.value = 'loading'
  entryInfo.value = null
  if(!route.params['book_number']) {
    loading.value = 'error'
    return
  }
  const result = await appContext.value.post('title/info', { book_number: route.params['book_number'] })
  if(result.success) {
    loading.value = 'success'
    entryInfo.value = EntityUtils.fromDict(Title.withDerivatives(), result.data)
    document.title = `《${entryInfo.value.title}》图书详情 - ${LIBRARY_NAME}`
  } else {
    loading.value = 'error'
    appContext.value.showToast('详情加载失败：' + Api.errorMessage(result.data))
  }
})

const stats = computed<StatEntry[]>(() => {
  const entry = entryInfo.value
  if(!entry) {
    return []
  }
  return [
    {
      label: '正常藏书数量',
      figure: entry.total - entry.deprecated
    },
    {
      label: '可借数量',
      figure: entry.total - entry.borrowed - entry.deprecated + entry.deprecated_and_borrowed
    },
    {
      label: '已借出数量',
      figure: entry.borrowed - entry.deprecated_and_borrowed
    },
    {
      label: '将淘汰数量',
      figure: entry.deprecated
    },
    ...(appContext.value.canManageBooks() ? [
      {
        label: '待采购数量',
        figure: entry.to_purchase_amount
      },
      {
        label: '待采购金额',
        figure: (entry.to_purchase_amount * entry.price_milliunit / 1000).toFixed(2)
      }
    ] : [])
  ]
})

</script>

<template>
  <v-fade-transition>
    <FullscreenError v-if="loading == 'error'">
      数据加载失败
    </FullscreenError>
  </v-fade-transition>
  <v-fade-transition>
    <v-container style="user-select: text" v-if="entryInfo">
      <h1 class="mb-4">{{ entryInfo.title }}</h1>
      <p class="mb-4"><code>{{ entryInfo.book_number }}</code></p>
      
      <table class="mb-4">
        <tbody>
          <tr>
            <th class="details-field">作者</th>
            <td>{{ entryInfo.author }}</td>
          </tr>
          <tr>
            <th class="details-field">出版社</th>
            <td>{{ entryInfo.publisher }}</td>
          </tr>
          <tr>
            <th class="details-field">年份</th>
            <td>{{ entryInfo.year }}</td>
          </tr>
          <tr>
            <th class="details-field">价格</th>
            <td>{{ (entryInfo.price_milliunit / 1000).toFixed(2) }}</td>
          </tr>
          <tr v-if="entryInfo.place">
            <th class="details-field">藏书地点</th>
            <td>{{ entryInfo.place }}</td>
          </tr>
          <tr v-if="entryInfo.url">
            <th class="details-field">在线阅读</th>
            <td><a target="_blank" :href="entryInfo.url">{{ entryInfo.url }}</a></td>
          </tr>
        </tbody>
      </table>

      <p class="mb-4" style="white-space: pre-wrap">{{ entryInfo.description ? entryInfo.description : '此书目没有详细描述' }}</p>

      <v-row v-if="entryInfo.place" class="mt-6">
        <v-col
          v-for="stat in stats"
          cols=12 sm=6 md=4 lg=3
        >
          <StatDisplay :entry="stat" />
        </v-col>
      </v-row>
      <p v-else>此书目没有线下藏书</p>
    </v-container>
  </v-fade-transition>
</template>

<style scoped>
  .details-field {
    text-align: left;
    padding-right: 1em;
  }
</style>

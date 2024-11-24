<script setup lang="ts">
import { computed, watchEffect, ref } from 'vue';
import LibraryIntroduction from '../../branding/LibraryIntroduction.vue';
import { useAppContext } from '../../context/AppContext';
import StatDisplay, { StatEntry } from '../component/StatDisplay.vue';
import { Api } from '../../api/Api';
import { borrows__historical, borrows__overdue, stocks__to_deprecate, titles__to_purchase } from '../intent/intents';
import LibraryHomepageFooter from '../../branding/LibraryHomepageFooter.vue';

type StatsData = {
  "title_count": number,
  "stock_count": number,
  "borrowed_title_count": number,
  "borrowed_stock_count": number,
  "users_count": number,
  "active_borrows"?: number,
  "borrows"?: number,
  "overdue_borrows"?: number,
  "to_purchase_count"?: number,
  "to_purchase_price"?: number,
  "deprecated_count"?: number
}

const appContext = useAppContext()
const statsData = ref<null | StatsData>(null)

const loading = ref<"loading" | "error" | "success">('loading')

watchEffect(async () => {
  const apiReturn = await appContext.value.post('stats')
  if(apiReturn.success) {
    loading.value = 'success'
    statsData.value = apiReturn.data
    return
  } else {
    loading.value = 'error'
    appContext.value.showToast('获取统计数据失败：' + Api.errorMessage(apiReturn.data))
  }
})

const stats = computed(() => {
  const data = statsData.value
  const context = appContext.value
  if(!data) return null
  const ret: StatEntry[] = []

  ret.push({
    label: '书目总量',
    figure: data.title_count,
    link: { label: '搜索书籍', to: '/search' }
  })
  ret.push({
    label: '藏书总量',
    figure: data.stock_count,
    ...(context.canManageBooks() && { link: { label: '藏书管理', to: '/manage/stocks' } })
  })
  ret.push({
    label: '借阅中的书目总量',
    figure: data.borrowed_title_count,
    ...(context.canManageBooks() && { link: { label: '书目管理', to: '/manage/titles' } })
  })
  ret.push({
    label: '借阅中的藏书数',
    figure: data.borrowed_stock_count,
    ...(context.canManageBooks() && { link: { label: '借阅管理', to: '/manage/borrows' } })
  })
  ret.push({
    label: '用户总数',
    figure: data.users_count,
    ...(context.canManageUsers() && { link: { label: '用户管理', to: '/manage/users' } })
  })
  if(data.active_borrows != null) {
    ret.push({
      label: '我借阅的藏书数',
      figure: data.active_borrows,
      ...(context.isLoggedIn() && { link: { label: '我的借阅', to: '/borrows' } })
    })
  }
  if(data.borrows != null) {
    ret.push({
      label: '我的历史借阅数',
      figure: data.borrows,
      ...(context.isLoggedIn() && { link: { label: '我的借阅', intent: borrows__historical, to: '/borrows' } })
    })
  }
  if(data.overdue_borrows != null) {
    ret.push({
      label: '我的逾期次数',
      figure: data.overdue_borrows,
      ...(context.isLoggedIn() && { link: { label: '我的借阅', intent: borrows__overdue, to: '/borrows' } })
    })
  }
  if(data.to_purchase_count != null) {
    ret.push({
      label: '待采购数量',
      figure: data.to_purchase_count,
      ...(context.canManageBooks() && { link: { label: '书目管理', intent: titles__to_purchase, to: '/manage/titles' } })
    })
  }
  if(data.to_purchase_price != null) {
    ret.push({
      label: '待采购总金额',
      figure: (data.to_purchase_price / 1000).toFixed(2),
      ...(context.canManageBooks() && { link: { label: '书目管理', intent: titles__to_purchase, to: '/manage/titles' } })
    })
  }
  if(data.deprecated_count != null) {
    ret.push({
      label: '待淘汰数量',
      figure: data.deprecated_count,
      ...(context.canManageBooks() && { link: { label: '藏书管理', intent: stocks__to_deprecate, to: '/manage/stocks' } })
    })
  }

  return ret
})

</script>

<template>
  <v-container style="user-select: text;">
    <LibraryIntroduction />

    <v-expand-transition>
      <v-row v-if="stats" class="mt-4 mb-4">
        <v-col
          v-for="stat in stats"
          cols=12 sm=6 md=4 lg=3
        >
          <StatDisplay :entry="stat" />
        </v-col>
      </v-row>
    </v-expand-transition>

    <LibraryHomepageFooter />
  </v-container>
</template>

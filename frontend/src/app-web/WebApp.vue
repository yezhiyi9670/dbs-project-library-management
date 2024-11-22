<script setup lang="ts">
import { computed, Ref, ref } from 'vue'
import { LIBRARY_LOGO_PATH, LIBRARY_NAME } from '../branding/titles';
import { useRoute, useRouter } from 'vue-router';
import { useAppContext } from '../context/AppContext';
import LoginCard from './component/login/LoginCard.vue';

const drawerOpen = ref(null)

interface MenuGroup {
  label: string,
  links: MenuEntry[]
}

interface MenuEntry {
  icon: string,
  label: string,
  to: string
  newTab?: boolean
}

function makeEntry(icon: string, label: string, to: string, newTab?: boolean) {
  return { icon, label, to, newTab }
}

const appContext = useAppContext()

const groups: Ref<MenuGroup[]> = computed(() => {
  const context = appContext.value
  return [
    {
      label: '',
      links: [
        makeEntry('mdi-home-outline', '主页', '/home'),
        makeEntry('mdi-book-outline', '搜索书籍', '/search')
      ]
    },
    ...(context.isLoggedIn() ? [
      {
        label: '',
        links: [
          makeEntry('mdi-invoice-outline', '我的借阅', '/borrows'),
          makeEntry('mdi-account-outline', '个人资料', '/account')
        ]
      }
    ] : []),
    ...((context.canManageBooks() || context.canManageUsers()) ? [
      {
        label: '内容管理',
        links: [
          ...(context.canManageUsers() ? [makeEntry('mdi-account-edit-outline', '用户管理', '/manage/users')] : []),
          ...(context.canManageBooks() ? [
            makeEntry('mdi-book-edit-outline', '书目管理', '/manage/titles'),
            makeEntry('mdi-layers-edit', '藏书管理', '/manage/stocks'),
            makeEntry('mdi-invoice-edit-outline', '借阅记录管理', '/manage/borrows')
          ] : [])
        ]
      }
    ] : []),
    {
      label: '模拟器',
      links: [
        makeEntry('mdi-network-outline', '自助借阅终端', '/device/terminal', true)
      ]
    }
  ]
})

const route = useRoute()
const activePageInfo = computed(() => {
  const routeUrl = route.fullPath
  let activeLink = ''
  let functionalTitle = '未知页面'
  if(route.name == 'Main.NotFound') {
    return { activeLink, functionalTitle }
  }
  if(route.name == 'Main.TitleDetails') {
    return { activeLink: '/search', functionalTitle: '图书详情' }
  }
  for(const { links } of groups.value) {
    for(const { label, to } of links) {
      if(routeUrl.startsWith(to)) {
        activeLink = to
        functionalTitle = label
      }
    }
  }
  return { activeLink, functionalTitle }
})

</script>

<template>
  <v-app id="inspire" class="principal-app-root">
    <v-navigation-drawer :width="280" mobile-breakpoint="lg" v-model="drawerOpen">
      <v-sheet
        class="pa-4"
      >
        <v-img
          v-if="LIBRARY_LOGO_PATH"
          :width="64"
          :height="64"
          class="mb-4"
          :src="LIBRARY_LOGO_PATH"
        />
        <v-avatar
          v-else
          class="mb-4"
          color="grey-darken-1"
          size="64"
        ></v-avatar>

        <div class="text-h5">{{ LIBRARY_NAME }}</div>

        <div class="mt-4" />

        <LoginCard />
      </v-sheet>

      <v-divider></v-divider>

      <v-list>
        <template v-for="{ label, links } in groups" :key="label">
          <v-list-subheader v-if="label">
            {{ label }}
          </v-list-subheader>
          <template v-for="{ icon, label, to, newTab } in links" :key="to">
            <v-list-item
              :to="to"
              :prepend-icon="icon"
              :title="label"
              :target="newTab ? '_blank' : ''"
            ></v-list-item>
          </template>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen"></v-app-bar-nav-icon>

      <v-app-bar-title>{{ activePageInfo.functionalTitle }}</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

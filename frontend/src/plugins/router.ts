import { createWebHashHistory, createRouter, RouteRecordRaw } from 'vue-router'

import WebApp from '../app-web/WebApp.vue'
import LibraryTerminalApp from '../app-terminal/LibraryTerminalApp.vue'
import DeviceNotFound from '../app-device-not-found/DeviceNotFound.vue'
import { LIBRARY_NAME } from '../branding/titles'
import mainRoutes from './route/mainRoutes'
import terminalRoutes from './route/terminalRoutes'

const routes: RouteRecordRaw[] = [
  { path: '/', meta: { title: LIBRARY_NAME }, component: WebApp, children: mainRoutes },
  { path: '/device/terminal', meta: { title: '自助借阅终端' }, component: LibraryTerminalApp, children: terminalRoutes },
  { path: '/device/:pathMatch(.*)*', name: 'Device.NotFound', meta: { title: '找不到设备' }, component: DeviceNotFound },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if(to.meta.title && typeof to.meta.title == 'string') {
    document.title = to.meta.title
  }
  next()
})

export default router

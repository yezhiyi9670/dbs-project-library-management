import { RouteRecordRaw } from 'vue-router'
import NotFoundPage from '../../app-terminal/error-pages/NotFoundPage.vue'
import MainPage from '../../app-terminal/pages/MainPage.vue'
import LoginPage from '../../app-terminal/pages/LoginPage.vue'
import DashboardPage from '../../app-terminal/pages/DashboardPage.vue'
import LogoutPage from '../../app-terminal/pages/LogoutPage.vue'
import BookCheckPage from '../../app-terminal/pages/BookCheckPage.vue'
import BookBorrowPage from '../../app-terminal/pages/BookBorrowPage.vue'
import BookReturnPage from '../../app-terminal/pages/BookReturnPage.vue'

export default [
  { path: '/device/terminal', component: MainPage },
  { path: '/device/terminal/login', component: LoginPage },
  { path: '/device/terminal/logout', component: LogoutPage },
  { path: '/device/terminal/dashboard', component: DashboardPage },
  { path: '/device/terminal/check', component: BookCheckPage },
  { path: '/device/terminal/borrow', component: BookBorrowPage },
  { path: '/device/terminal/return', component: BookReturnPage },

  { path: '/device/terminal/:pathMatch(.*)*', name: 'Terminal.NotFound', component: NotFoundPage }
] satisfies RouteRecordRaw[]

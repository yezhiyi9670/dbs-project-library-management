import { RouteRecordRaw } from "vue-router";
import { LIBRARY_NAME } from "../../branding/titles";
import SearchPage from '../../app-web/pages/SearchPage.vue'
import HomePage from '../../app-web/pages/HomePage.vue'
import BorrowsPage from '../../app-web/pages/BorrowsPage.vue'
import AccountPage from '../../app-web/pages/AccountPage.vue'
import ManageUsersPage from '../../app-web/pages/ManageUsersPage.vue'
import ManageTitlesPage from '../../app-web/pages/ManageTitlesPage.vue'
import ManageStocksPage from '../../app-web/pages/ManageStocksPage.vue'
import ManageBorrowsPage from '../../app-web/pages/ManageBorrowsPage.vue'
import NotFoundPage from '../../app-web/error-pages/NotFoundPage.vue'
import TitleDetailsPage from "../../app-web/pages/TitleDetailsPage.vue";

export default [
  { path: '/', redirect: '/home' },
  { path: '/home', meta: { title: `${LIBRARY_NAME}` }, component: HomePage },
  { path: '/search', meta: { title: `搜索书籍 - ${LIBRARY_NAME}` }, component: SearchPage },
  { path: '/book-details/:book_number', name: 'Main.TitleDetails', meta: { title: `图书详情 - ${LIBRARY_NAME}` }, component: TitleDetailsPage },
  { path: '/borrows', meta: { title: `我的借阅 - ${LIBRARY_NAME}` }, component: BorrowsPage },
  { path: '/account', meta: { title: `个人资料 - ${LIBRARY_NAME}` }, component: AccountPage },
  { path: '/manage/users', meta: { title: `用户管理 - ${LIBRARY_NAME}` }, component: ManageUsersPage },
  { path: '/manage/titles', meta: { title: `书籍管理 - ${LIBRARY_NAME}` }, component: ManageTitlesPage },
  { path: '/manage/stocks', meta: { title: `藏书管理 - ${LIBRARY_NAME}` }, component: ManageStocksPage },
  { path: '/manage/borrows', meta: { title: `借阅记录管理 - ${LIBRARY_NAME}` }, component: ManageBorrowsPage },

  { path: '/:pathMatch(.*)*', name: 'Main.NotFound', meta: { title: `找不到页面 - ${LIBRARY_NAME}` }, component: NotFoundPage }
] satisfies RouteRecordRaw[]

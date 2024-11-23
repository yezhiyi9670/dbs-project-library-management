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
import { borrows__filter_username, stocks__filter_book_number } from '../intent/intents';
import PermissionGuard from '../component/PermissionGuard.vue';
import User from '@library-management/common/entity/user';
import UserEditForm from '../form/edit/UserEditForm.vue';
import UserEditActions from '../display/actions/UserEditActions.vue';
import UsersFilterForm from '../form/filter/UsersFilterForm.vue';

const appContext = useAppContext()
const router = useRouter()
const conditions = ref<Object | null>(null)
const originalEntry = ref<User | null>(null)

const serverItems: Ref<User[]> = ref([])
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
  const result = await appContext.value.post('user/manage/list', {
    ...conditions.value,
    pn: page.value, rn: itemsPerPage.value,
    ...(sortBy.value[0] && { sort_by: sortBy.value[0].key, sort_dir: sortBy.value[0].order })
  })
  loading.value = false
  if(result.success) {
    totalItems.value = result.data.count
    serverItems.value = result.data.window.map((item: Object) => EntityUtils.fromDict(User.withDerivatives(), item))
  } else {
    totalItems.value = 0
    serverItems.value = []
    appContext.value.showToast('查询失败：' + Api.errorMessage(result.data))
  }
}

watchEffect(reload)

const editFormToken = ref('')
const editFormOpen = ref(false)
function handleEdit(item: User | null) {
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
  if(!editFormOpen.value) {
    await reload()
  }
})

async function handleToggle(item: User) {
  if(item.enabled) {
    const result = await appContext.value.post('user/manage/update', {
      old_username: item.username,
      enabled: false
    })
    if(result.success) {
      appContext.value.showToast('成功禁用用户')
      await reload()
    } else {
      appContext.value.showToast('操作失败：' + Api.errorMessage(result.data))
    }
  } else {
    const result = await appContext.value.post('user/manage/update', {
      old_username: item.username,
      enabled: true
    })
    if(result.success) {
      appContext.value.showToast('成功启用用户')
      await reload()
    } else {
      appContext.value.showToast('操作失败：' + Api.errorMessage(result.data))
    }
  }
}

async function handleDelete(item: User) {
  const result = await appContext.value.post('user/manage/delete', {
    old_username: item.username
  })
  if(result.success) {
    appContext.value.showToast('删除成功')
    await reload()
  } else {
    appContext.value.showToast('删除失败：' + Api.errorMessage(result.data))
  }
}

function handleSeeBorrows(item: User, newTab: boolean) {
  appContext.value.putIntent([ borrows__filter_username, item.username ])
  if(newTab) {
    window.open('#/manage/borrows')
  } else {
    router.push('/manage/borrows')
  }
}

</script>

<template>
  <PermissionGuard require-user-admin>

    <v-dialog v-model="editFormOpen" max-width="800">
      <UserEditForm :key="editFormToken" @close="handleEditFinish" :original="originalEntry" />
    </v-dialog>

    <v-container>
      <UsersFilterForm @add="handleEdit(null)" :loading="loading" @change="v => conditions = v" can-add />

      <v-card class="mt-4">
        <v-data-table-server
          :headers="[
            {key: 'username', title: '用户名'},
            {key: 'email', title: '电子邮箱'},
            {key: 'display_name', title: '显示名称'},
            {key: 'role', title: '权限等级'},
            {key: '__.borrows', title: '借阅数'},
            {key: 'overdue_borrows', title: '逾期数'},
            {key: 'enabled', title: '允许登录'},
            {key: '__actions', title: '操作', sortable: false},
          ]"
          v-model:sort-by="sortBy"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
        >
          <template v-slot:item.__.borrows="{ item }">
            {{ item.active_borrows }}/{{ item.borrows }}
          </template>
          <template v-slot:item.enabled="{ item }">
            {{ item.enabled ? '是' : '' }}
          </template>
          <template v-slot:item.__actions="{ item }">
            <UserEditActions
              :key="item.username"
              @edit="handleEdit(item)"
              @disable="handleToggle(item)"
              @see-borrows="newTab => handleSeeBorrows(item, newTab)"
              @delete="handleDelete(item)"
              :user="item"
            />
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>

  </PermissionGuard>
</template>

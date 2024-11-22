<script setup lang="ts">
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import Title from '@library-management/common/entity/title';
import { ref, effect } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../api/Api';
import { useAppContext } from '../../context/AppContext';
import PermissionGuard from '../component/PermissionGuard.vue';
import User from '@library-management/common/entity/user';
import FullscreenError from '../error-pages/FullscreenError.vue';
import UserSelfUpdateForm from '../form/UserSelfUpdateForm.vue';
import UserLogoutOthersForm from '../form/UserLogoutOthersForm.vue';

const appContext = useAppContext()

const user = ref<User | null>(null)
const loading = ref<'loading' | 'success' | 'error'>('loading')
const route = useRoute()

effect(async () => {
  loading.value = 'loading'
  user.value = null
  const result = await appContext.value.post('user/info')
  if(result.success && result.data != null) {
    loading.value = 'success'
    user.value = EntityUtils.fromDict(User.withDerivatives(), result.data)
  } else {
    loading.value = 'error'
    appContext.value.showToast('用户信息加载失败：' + Api.errorMessage(result.data))
  }
})

</script>

<template>
  <PermissionGuard>
    <v-fade-transition>
      <FullscreenError v-if="loading == 'error'">
        数据加载失败
      </FullscreenError>
    </v-fade-transition>
    <v-fade-transition>
      <v-container style="user-select: text" v-if="user">
        <h1 class="mb-4">基本信息</h1>
        <table class="mb-4">
          <tbody>
            <tr>
              <th class="details-field">用户名</th>
              <td>{{ user.username }}</td>
            </tr>
            <tr>
              <th class="details-field">权限等级</th>
              <td>{{ user.role }}</td>
            </tr>
            <tr>
              <th class="details-field">允许忘记密码</th>
              <td>{{ user.can_reset ? '是' : '否' }}</td>
            </tr>
          </tbody>
        </table>
        <v-divider />
        <h1 class="mt-4 mb-4">更新个人资料</h1>
        <v-row>
          <v-col :cols="12" :md="6">
            <UserSelfUpdateForm :original-email="user.email" :original-display-name="user.display_name" />
          </v-col>
        </v-row>
        <v-divider class="mt-6" />
        <h1 class="mt-4 mb-4">其他选项</h1>
        <div class="mt-4 mb-4">如果你不慎在公用机器上登录你的账户而忘记登出，请点击下方按钮。<br/>这将会使你的账户在其他设备上登出（包括图书馆自助借阅终端）。<br/>注意，如果仅仅修改密码，通过刷卡登录的图书馆自助借阅终端不会登出。</div>
        <UserLogoutOthersForm />
      </v-container>
    </v-fade-transition>
  </PermissionGuard>
</template>

<style scoped>
  .details-field {
    text-align: left;
    padding-right: 1em;
  }
</style>

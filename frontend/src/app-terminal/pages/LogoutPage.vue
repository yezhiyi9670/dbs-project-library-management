<script setup lang="ts">
import ToCenter from '../../component/ToCenter.vue';
import { Api } from '../../api/Api';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'vue-router';
import PermissionGuard from '../component/PermissionGuard.vue';

const appContext = useAppContext()
const router = useRouter()

async function handleLogout() {
  const result = await appContext.value.post('user/logout', {})
  if(result.success) {
    appContext.value.setUserAndSession(null, null)
    appContext.value.showToast('登出成功')
    router.push('/device/terminal')
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
    router.push('/device/terminal/dashboard')
  }
}

if(appContext.value.isLoggedIn()) {
  handleLogout()
}

</script>
<template>
  <PermissionGuard>
    <ToCenter>
      <v-icon icon="mdi-exit-run" size="80" />
      <div class="mt-4" style="font-size:1.5em">正在退出登录</div>
      <div class="mt-2">为了你的账户安全，请确认退出完成再离开</div>
    </ToCenter>
  </PermissionGuard>
</template>

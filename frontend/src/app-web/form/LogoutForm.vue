<script setup lang="ts">
import { ref } from 'vue';
import { Api } from '../../api/Api';
import { useAppContext } from '../../context/AppContext';

const appContext = useAppContext()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)

async function handleLogout() {
  loading.value = true
  const result = await appContext.value.post('user/logout', {})
  loading.value = false
  if(result.success) {
    appContext.value.setUserAndSession(null, null)
    appContext.value.showToast('登出成功')
    emit('close')
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

</script>
<template>
  <v-card title="登出">
    <v-divider></v-divider>
    <v-card-text class="mt-2">
      <p class="mb-6">你确定要登出吗？</p>

      <v-btn
        :disabled="loading"
        color="primary"
        text="登出"
        @click="handleLogout"
        class="mr-4"
      ></v-btn>
      <v-btn
        :disabled="loading"
        color="secondary"
        text="取消"
        @click="emit('close')"
      ></v-btn>
    </v-card-text>
  </v-card>
</template>

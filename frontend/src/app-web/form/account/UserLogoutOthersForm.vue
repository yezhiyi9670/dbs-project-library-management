<script setup lang="ts">
import { ref } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';

const appContext = useAppContext()

const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  const result = await appContext.value.post('user/logout-others')
  loading.value = false
  if(result.success) {
    appContext.value.showToast('登出其他设备成功')
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

</script>
<template>
  <div>
    <v-btn
      :loading="loading"
      :disabled="loading"
      color="tertiary"
      text="登出其他设备"
      @click="handleSubmit"
      class="mr-4"
    ></v-btn>
  </div>
</template>

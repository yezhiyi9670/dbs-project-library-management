<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import User from '@library-management/common/entity/user';

const appContext = useAppContext()

const emit = defineEmits<{
  close: []
}>()

const valid = ref(false)
const username = ref('')
const password = ref('')

const loading = ref(false)

async function handleLogin() {
  if(!valid.value) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('user/login', {
    username: username.value,
    password: password.value
  })
  loading.value = false
  if(result.success) {
    appContext.value.setUserAndSession(EntityUtils.fromDict(new User(), result.data.user), result.data.session)
    appContext.value.showToast('登录成功')
    emit('close')
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

const firstField = useTemplateRef('first-field')
watch(firstField, () => {
  setTimeout(() => {
    firstField.value?.focus()
  }, 10) // Temp hack. Without timeout it does not work.
})

</script>
<template>
  
  <v-card title="登录">
    <div @keydown.enter="handleLogin">
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <v-form v-model="valid">
          <v-text-field
            name="username"
            ref="first-field"
            v-model="username"
            label="用户名"
            :rules="[v => !!v]"
            required
          />
          <v-text-field
            name="password"
            v-model="password"
            label="密码"
            type="password"
            :rules="[v => !!v]"
            required
          />
        </v-form>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="登录"
          @click="handleLogin"
          class="mr-4"
        ></v-btn>
        <v-btn
          :disabled="loading"
          color="secondary"
          text="取消"
          @click="emit('close')"
        ></v-btn>
      </v-card-text>
    </div>
  </v-card>
</template>

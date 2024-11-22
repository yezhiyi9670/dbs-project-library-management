<script setup lang="ts">
import { useRouter } from 'vue-router';
import ToCenter from '../../component/ToCenter.vue';
import ReturnButton from '../component/ReturnButton.vue';
import SmallerMainTitle from '../component/SmallerMainTitle.vue';
import { ref } from 'vue';
import { useAppContext } from '../../context/AppContext';
import { Api } from '../../api/Api';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import User from '@library-management/common/entity/user';

const router = useRouter()

const appContext = useAppContext()

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
    router.push('/device/terminal/dashboard')
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

</script>

<template>
  <ReturnButton icon="mdi-arrow-left" to="/device/terminal">
    返回
  </ReturnButton>
  <ToCenter>
    <SmallerMainTitle>密码登录</SmallerMainTitle>
    <div style="width: 60%; margin: 0 auto;" @keydown.enter="handleLogin">
      <v-form v-model="valid">
        <v-text-field
          v-model="username"
          label="用户名"
          :rules="[v => !!v]"
          required
        />
        <v-text-field
          v-model="password"
          label="密码"
          type="password"
          :rules="[v => !!v]"
          required
        />
      </v-form>
      <v-btn
        size="large"
        :disabled="!valid || loading"
        color="primary"
        text="登录"
        @click="handleLogin"
        class="mt-4"
      ></v-btn>
    </div>
  </ToCenter>
</template>

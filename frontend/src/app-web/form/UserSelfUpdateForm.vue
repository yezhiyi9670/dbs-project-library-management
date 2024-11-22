<script setup lang="ts">
import { ref } from 'vue';
import { Api } from '../../api/Api';
import { useAppContext } from '../../context/AppContext';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import User from '@library-management/common/entity/user';
import { UserValidation } from '@library-management/common/entity/user/validation';

const props = defineProps<{
  originalEmail: string,
  originalDisplayName: string
}>()

const appContext = useAppContext()

const valid = ref(false)
const display_name = ref(props.originalDisplayName)
const email = ref(props.originalEmail)
const old_password = ref('')
const password = ref('')
const password_2 = ref('')

const loading = ref(false)

async function handleSubmit() {
  if(!valid.value) {
    return
  }
  if(password.value != password_2.value) {
    appContext.value.showToast('两次输入新密码不匹配')
    return
  }
  loading.value = true
  const result = await appContext.value.post('user/update', {
    old_password: old_password.value,
    email: email.value,
    display_name: display_name.value,
    password: password.value
  })
  loading.value = false
  if(result.success) {
    appContext.value.setUser(EntityUtils.fromDict(new User(), result.data))
    appContext.value.showToast('修改成功')
    if(password.value) {
      // Password is changed. The user should logout.
      location.href = '#/'
      location.reload()
    }
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

</script>
<template>
  
  <div @keydown.enter="handleSubmit">
    <v-form v-model="valid">
      <v-text-field
        type="text"
        v-model="display_name"
        label="显示名称"
        :rules="Api.validationRules([UserValidation.validateDisplayName_])"
      />
      <div class="mt-0 mb-4">修改以下内容需要提供原密码：</div>
      <v-text-field
        type="password"
        v-model="old_password"
        label="原密码"
      />
      <v-text-field
        type="text"
        v-model="email"
        label="邮箱"
        :rules="Api.validationRules([UserValidation.validateEmail_])"
      />
      <v-text-field
        v-model="password"
        label="新密码（留空则不修改）"
        type="password"
      />
      <v-text-field
        v-model="password_2"
        label="确认新密码"
        type="password"
      />
    </v-form>
    <v-btn
      :disabled="!valid || loading"
      color="primary"
      text="确定"
      @click="handleSubmit"
      class="mr-4"
    ></v-btn>
  </div>
</template>

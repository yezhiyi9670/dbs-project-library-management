<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import User from '@library-management/common/entity/user';
import { UserValidation } from '@library-management/common/entity/user/validation';
import { UserRole } from '@library-management/common/entity/user/role';

const props = defineProps<{
  original: User | null
}>()
const appContext = useAppContext()
const emit = defineEmits<{
  close: [next: boolean]
}>()

const valid = ref(false)

const old_username = computed(() => {
  if(props.original == null) {
    return null
  }
  return props.original.username
})
const username = ref(props.original?.username ?? '')
const email = ref(props.original?.email ?? '')
const display_name = ref(props.original?.display_name ?? '')
const role = ref(props.original?.role ?? 'Reader')
const can_reset = ref(props.original?.can_reset ?? false)
const enabled = ref(props.original?.enabled ?? true)
const password = ref('')

const loading = ref(false)

async function handleSubmit(next: boolean) {
  if(!valid.value) {
    return
  }
  loading.value = true
  const result = await appContext.value.post('user/manage/update', {
    old_username: old_username.value,
    username: username.value,
    email: email.value,
    display_name: display_name.value,
    role: role.value,
    can_reset: can_reset.value,
    enabled: enabled.value,
    password: password.value
  })
  loading.value = false
  if(result.success) {
    appContext.value.showToast('更新成功')
    emit('close', next)
  } else {
    const msg = Api.errorMessage(result.data)
    appContext.value.showToast(msg)
  }
}

const selectableRoles = computed(() => {
  return Object.values(UserRole).filter(item => {
    return appContext.value.canManageUserOfRole(item)
  }).map(item => ({value: item, title: item}))
})

const colSpec = { cols: 12, sm: 6 }

const firstField = useTemplateRef('first-field')
watch(firstField, () => {
  firstField.value?.focus()
})

</script>
<template>
  
  <v-card :title="old_username == null ? '新建用户' : '更新用户'">
    <div
      @keydown.enter.shift.prevent="() => handleSubmit(true)"
      @keydown.enter.exact.prevent="() => handleSubmit(false)"
    >
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <v-form class="mb-4" v-model="valid">
          <v-row dense>
            <v-col :="colSpec">
              <v-text-field
                ref="first-field"
                v-model="username"
                label="用户名"
                :rules="Api.validationRules([UserValidation.validateUsername_], true)"
                required
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="email"
                label="电子邮箱"
                :rules="Api.validationRules([UserValidation.validateEmail_], true)"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                type="password"
                v-model="password"
                :label="props.original ? '重置密码（留空则不修改）' : '设置密码'"
              />
            </v-col>
            <v-col :="colSpec">
              <v-text-field
                v-model="display_name"
                label="显示名称"
                :rules="Api.validationRules([UserValidation.validateDisplayName_])"
              />
            </v-col>
            <v-col :="colSpec">
              <v-select
                v-model="role"
                label="权限等级"
                :items="selectableRoles"
              />
            </v-col>
            <v-col :="colSpec">
              <v-select
                v-model="enabled"
                label="允许登录"
                :items="[
                  { value: false, title: '否' },
                  { value: true, title: '是' }
                ]"
              />
            </v-col>
            <v-col :="colSpec">
              <v-select
                v-model="can_reset"
                label="允许忘记密码"
                :items="[
                  { value: false, title: '否' },
                  { value: true, title: '是（未实现）' }
                ]"
              />
            </v-col>
          </v-row>
        </v-form>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="更新"
          @click="() => handleSubmit(false)"
          class="mr-4"
        ></v-btn>
        <v-btn
          :loading="loading"
          :disabled="!valid || loading"
          color="primary"
          text="更新并继续添加"
          @click="() => handleSubmit(true)"
          class="mr-4"
        ></v-btn>
        <v-btn
          :disabled="loading"
          color="secondary"
          text="取消"
          @click="emit('close', false)"
        ></v-btn>
      </v-card-text>
    </div>
  </v-card>
</template>

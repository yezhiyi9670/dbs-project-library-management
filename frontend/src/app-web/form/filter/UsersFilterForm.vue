<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import { FilterTyping } from '@library-management/common/typing/FilterTyping'
import { Api } from '../../../api/Api';
import { useAppContext } from '../../../context/AppContext';
import { borrows__historical, borrows__overdue, users__filter_username } from '../../intent/intents';
import { RandomToken } from '@library-management/common/crypto/RandomToken';
import { UserRole } from '@library-management/common/entity/user/role';
import { UserValidation } from '@library-management/common/entity/user/validation';

const props = defineProps<{
  loading: boolean,
  canAdd?: boolean
}>()
const emit = defineEmits<{
  change: [conditions: Object],
  add: []
}>()

const dirty = ref(false)

const appContext = useAppContext()

const intent = appContext.value.getIntent()
let initialUsername = ''
if(Array.isArray(intent) && intent[0] == users__filter_username) {
  initialUsername = intent[1]
}

const seq = ref<string>('')

const search_key = ref<string>('')
const username = ref<string>(initialUsername)
const roles = ref<UserRole[]>([])
const overdue_min = ref<string>('')

const conditions = computed(() => ({
  __seq: seq.value,
  search_key: FilterTyping.toString(search_key.value),
  username: FilterTyping.toString(username.value),
  roles: FilterTyping.toSet(roles.value),
  overdue_min: FilterTyping.toNumber(overdue_min.value)
}))

watch(conditions, () => {
  dirty.value = true
})

function refresh() {
  if(!dirty.value) {
    seq.value = RandomToken.alphanum(24)
  }
  nextTick(updateFilters)
}
function updateFilters() {
  if(!dirty.value) return
  dirty.value = false
  emit('change', conditions.value)
}

const selectableRoles = computed(() => {
  return Object.values(UserRole).filter(item => {
    return appContext.value.canManageUserOfRole(item)
  }).map(item => ({value: item, title: item}))
})

const colSpec = { cols: 12, sm: 6, md: 4 }

emit('change', conditions.value)

</script>

<template>
  
  <v-card class="pa-4">
    <div @keydown.enter.prevent="updateFilters">
      <v-form>
        <v-row dense>
          <v-col :="colSpec">
            <v-text-field
              v-model="search_key"
              density="compact"
              hide-details
              label="搜索名字"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              v-model="username"
              density="compact"
              hide-details
              label="用户名（精准匹配）"
              :rules="Api.validationRules([UserValidation.validateUsername_])"
            />
          </v-col>
          <v-col :="colSpec">
            <v-select
              label="权限等级（析取）"
              density="compact"
              v-model="roles"
              hide-details
              multiple
              :items="selectableRoles"
            />
          </v-col>
          <v-col :="colSpec">
            <v-text-field
              type="number"
              label="最小逾期数量"
              density="compact"
              v-model="overdue_min"
              hide-details
            />
          </v-col>
          <v-col :="colSpec">
            <v-btn :disabled="loading" :loading="loading" :color="dirty ? 'primary' : 'tertiary'" @click="refresh">
              {{ dirty ? '更新筛选' : '刷新查询' }}
            </v-btn>
            <v-btn @click="emit('add')" v-if="canAdd" class="ml-2">
              <v-icon icon="mdi-plus" /> 新建用户
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-card>

</template>

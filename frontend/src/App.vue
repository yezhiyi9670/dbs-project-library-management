<script setup lang="ts">
import { watchEffect, provide, Ref, ref } from 'vue';
import InitLoading from './common/InitLoading.vue';
import { AppContext, AppContextInject } from './context/AppContext';
import { Api } from './api/Api';
import InitError from './common/InitError.vue';
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import User from '@library-management/common/entity/user';

const appContext: Ref<AppContext | undefined> = ref(undefined)
provide(AppContextInject, appContext)

const loading = ref<'loading' | 'success' | 'error'>('loading')
watchEffect(async () => {
  for(let i = 0; i < 3; i++) {
    const apiReturn = await Api.post('')
    if(apiReturn.success) {
      if(apiReturn.data.user) {
        apiReturn.data.user = EntityUtils.fromDict(new User(), apiReturn.data.user)
      }
      appContext.value = new AppContext(apiReturn.data)
      loading.value = 'success'
      return
    }
  }
  loading.value = 'error'
})
</script>

<template>
  <div v-if="loading == 'success'" class="screen">
    <RouterView />
  </div>
  <div v-if="loading == 'error'" class="screen">
    <InitError />
  </div>
  <v-fade-transition>
    <div class="screen" v-if="loading == 'loading'">
      <InitLoading />
    </div>
  </v-fade-transition>
  <v-snackbar v-if="appContext" v-model="appContext.toastManager.showing" attach=".principal-app-root">
    {{ appContext.toastManager.text }}
  </v-snackbar>
</template>

<style scoped>
  .screen {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: #fff;
  }
</style>

<script setup lang="ts">
import { useAppContext } from '../../../context/AppContext';
import LoginForm from '../../form/login/LoginForm.vue';
import LogoutForm from '../../form/login/LogoutForm.vue';

const appContext = useAppContext()

</script>

<template>
  <template v-if="!appContext.isLoggedIn()">
    <v-dialog max-width="500">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" color="primary">登录</v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <LoginForm @close="isActive.value=false" />
      </template>
    </v-dialog>
  </template>
  <template v-else>
    <p class="mb-3">你好，{{ appContext.getUserDisplayName() }}！</p>
    <v-dialog max-width="500">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" color="secondary">登出</v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <LogoutForm @close="isActive.value=false" />
      </template>
    </v-dialog>
  </template>
</template>

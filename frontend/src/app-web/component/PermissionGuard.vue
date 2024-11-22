<script setup lang="ts">

const props = defineProps<{
  requireBookAdmin?: boolean,
  requireUserAdmin?: boolean
}>()

import { useAppContext } from '../../context/AppContext';
import LoginRequiredPage from '../error-pages/LoginRequiredPage.vue';
import PermissionDeniedPage from '../error-pages/PermissionDeniedPage.vue';

const appContext = useAppContext()

</script>

<template>
  <template v-if="appContext.isLoggedIn()">
    <PermissionDeniedPage v-if="
      (props.requireBookAdmin && !appContext.canManageBooks()) || (props.requireUserAdmin && !appContext.canManageUsers())
    " />
    <slot v-else />
  </template>
  <template v-else>
    <LoginRequiredPage />
  </template>
</template>

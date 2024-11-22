<script setup lang="ts">

import { useAppContext } from '../../context/AppContext';
import LoginRequiredPage from '../error-pages/LoginRequiredPage.vue';

const appContext = useAppContext()

</script>

<template>
  <template v-if="appContext.isLoggedIn()">
    <slot />
  </template>
  <template v-else>
    <LoginRequiredPage />
  </template>
</template>

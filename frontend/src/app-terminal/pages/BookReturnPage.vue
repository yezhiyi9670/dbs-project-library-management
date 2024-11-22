<script setup lang="ts">
import PermissionGuard from '../component/PermissionGuard.vue';
import BookManipulationPage from './BookManipulationPage.vue';
</script>

<template>
  <PermissionGuard>
    <BookManipulationPage action="return" />
  </PermissionGuard>
</template>

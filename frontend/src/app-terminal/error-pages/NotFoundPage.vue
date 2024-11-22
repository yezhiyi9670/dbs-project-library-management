<script setup lang="ts">
import ToCenter from '../../component/ToCenter.vue';
</script>

<template>
  <ToCenter>
    <v-icon size=64 color="secondary" icon="mdi-file-remove-outline" /><br />
    <div class="mt-2 text-secondary">无法找到此页面</div>
    <RouterLink to="/device/terminal"><v-btn class="mt-4" color="secondary">返回主页</v-btn></RouterLink>
  </ToCenter>
</template>

<script setup lang="ts">
import ToCenter from '../../component/ToCenter.vue';
</script>

<template>
  <ToCenter>
    <v-icon size=64 color="secondary" icon="mdi-door-closed-cancel" /><br />
    <div class="mt-2 text-secondary">你没有权限使用此功能</div>
    <RouterLink to="/"><v-btn class="mt-4" color="secondary">返回主页</v-btn></RouterLink>
  </ToCenter>
</template>

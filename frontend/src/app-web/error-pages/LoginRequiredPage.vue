<script setup lang="ts">
import ToCenter from '../../component/ToCenter.vue';
</script>

<template>
  <ToCenter>
    <v-icon size=64 color="secondary" icon="mdi-key-outline" /><br />
    <div class="mt-2 text-secondary">你需要登录才能使用此功能</div>
    <RouterLink to="/"><v-btn class="mt-4" color="secondary">返回主页</v-btn></RouterLink>
  </ToCenter>
</template>

<script setup lang="ts">
import ToCenter from '../component/ToCenter.vue';
</script>

<template>
  <ToCenter>
    <div class="terminal-root principal-app-root">
      <RouterView />
    </div>
  </ToCenter>
</template>

<style scoped>
  .terminal-root {
    background-color: #F6F2FC;
    width: 800px;
    height: 600px;
    display: inline-block;
    position: relative;
    transform: scale(1.25);
    color: #433D4B;
  }
</style>

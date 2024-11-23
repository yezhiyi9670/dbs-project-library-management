<script setup lang="ts">
import ToCenter from '../component/ToCenter.vue';
</script>

<template>
  <ToCenter>
    <div class="warp-root"> <!--Ensure correct bounding behavior-->
      <div class="terminal-root principal-app-root">
        <RouterView />
      </div>
    </div>
  </ToCenter>
</template>

<style scoped>
  .warp-root {
    display: inline-block;
    width: 1000px;
    height: 750px;
    text-align: left;
  }
  .terminal-root {
    background-color: #F6F2FC;
    width: 800px;
    height: 600px;
    display: inline-block;
    position: relative;
    transform: scale(1.25);
    transform-origin: 0 0;
    color: #433D4B;
  }
</style>

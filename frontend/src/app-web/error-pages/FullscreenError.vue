<script setup lang="ts">
import ToCenter from '../../component/ToCenter.vue';

</script>

<template>
  <ToCenter>
    <v-icon size=64 color="secondary" icon="mdi-file-remove-outline" /><br />
    <div class="mt-2 text-secondary"><slot /></div>
  </ToCenter>
</template>

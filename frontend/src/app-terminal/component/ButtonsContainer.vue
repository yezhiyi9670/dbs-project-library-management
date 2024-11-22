<template>
  <div class="buttons-container">
    <slot />
  </div>
</template>

<style scoped>
  .buttons-container {
    gap: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

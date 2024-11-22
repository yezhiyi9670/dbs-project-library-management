<template>
  <div class="outer">
    <div class="inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
  .outer { width: 100%; height: 100%; display: table; }
  .inner { height: 100%; display: table-cell; vertical-align: middle; text-align: center; }
</style>

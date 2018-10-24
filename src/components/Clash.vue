<template>
  <div class="clash-line">
    <div class="clash-line-start"></div>
    <div class="clash-line-end"></div>
  </div>
</template>

<script>
  export default {}
</script>

<style scoped>
  .clash-line {
    z-index: 3;
  }
  .clash-line-start {
    position: absolute;
    background-color: #000;
    width: 3px;
    top: 0px;
    bottom: 0px;
    left: 0px;
  }
  .clash-line-end {
    position: absolute;
    background-color: #000;
    width: 3px;
    top: 0px;
    bottom: 0px;
    right: 0px;
  }
</style>

<template>
  <div class="clash" :class="{ allowed: allowed }">
    <div class="left"></div>
    <div class="right"></div>
  </div>
</template>

<script>
  export default {
    props: {
      allowed: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style scoped>
.left, .right {
  width: 5px;
  position: absolute;
  top: 0px;
  bottom: 0px;
  background-color: #000;
  border-color: #D32F2F;
  border-style: solid;
  border-width: 0px;
  transition: border-color 0.3s;
}
.allowed .left, .allowed .right {
  border-color: #FFA000;
}
.left {
  left: 0px;
  border-left-width: 2px;
}
.right {
  right: 0px;
  border-right-width: 2px;
}
</style>
